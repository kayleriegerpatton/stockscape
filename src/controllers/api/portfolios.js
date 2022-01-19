// IMPORTS
const { User, Portfolio, Company, PortfolioCompany } = require("../../models");
const {
  logError,
  getPayloadWithValidFieldsOnly,
} = require("../../helpers/utils");

// /api/portfolios
const addPortfolio = async (req, res) => {
  try {
    const { company, units } = req.body;

    // get payload: USE getPayloadWithValidFieldsOnly HERE
    if (company && units) {
      await Portfolio.create({
        company,
        units,
        user_id: req.session.user.id,
      });

      return res.json({
        success: true,
        data: `Added new investment portfolio.`,
      });
    }

    // missing/bad data entry in request
    return res.status(400).json({
      success: false,
      error: "Please provide the appropriate data entries.",
    });

    // server error
  } catch (error) {
    logError("POST investment portfolio", error.message);
    res.status(500).json({ success: false, error: "Failed to send response." });
  }
};

// /api/portfolios/:id
const updatePortfolio = async (req, res) => {
  try {
    // get payload: USE getPayloadWithValidFieldsOnly HERE
    const { company, units, id } = req.body;
    const { userId } = req.session.user;

    // check for portfolio in db
    const investmentPortfolioId = await Portfolio.findByPk(id);
    if (investmentPortfolioId) {
      await Portfolio.update(
        { company, units, user_id: userId },
        {
          where: {
            id,
          },
        }
      );

      return res.json({
        success: true,
        data: `Updated investment portfolio ${id}.`,
      });
    }
    return res.status(404).json({
      success: false,
      error: `Investment portfolio with id ${id} doesn't exist.`,
    });
  } catch (error) {
    logError("PUT investment profile", error.message);
    return res
      .status(500)
      .json({ success: false, error: "Failed to send response." });
  }
};

// /api/portfolios/:id
const deletePortfolio = async (req, res) => {
  try {
    // delete portfolio by id
    await Portfolio.destroy({
      where: {
        id: req.params.id,
      },
    });

    return res.json({
      success: true,
      data: `Portfolio with id ${req.params.id} deleted.`,
    });
  } catch (error) {
    logError("DELETE investment profile", error.message);
    return res
      .status(500)
      .json({ success: false, error: "Failed to send response." });
  }
};

// /api/portfolios/leaderboard
const handleLeaderBoardData = async (req, res) => {
  try {
    const payload = getPayloadWithValidFieldsOnly(["id"], req.body);

    // if not all payload fields are present, throw error
    if (Object.keys(payload).length !== 1) {
      return res
        .status(400)
        .json({ success: false, error: "Please provide the valid fields." });
    }

    // get all portfolios(for name) + company(for stockReturns) + users(for username)
    const portfoliosFromDB = await Portfolio.findAll({
      include: [
        {
          model: Company,
          through: PortfolioCompany,
          attributes: ["janPrice", "decPrice", "gainLoss"],
        },
        { model: User, attributes: ["username"] },
      ],
    });

    // map to get plain data
    const portfoliosData = portfoliosFromDB.map((portfolio) =>
      portfolio.get({ plain: true })
    );

    console.log("Plain portfolios data:", portfoliosData);

    const reducer = (value, nextValue) => value + nextValue;

    // transform data object to include: portfolio name, total year end return (add all company stock returns), and username
    const portfolios = portfoliosData.map((portfolio) => {
      return {
        portfolioName: portfolio.name,
        user: portfolio.user.username,
        stockReturns: portfolio.companies.map((company) => {
          // calculate each company's year end return
          const stockReturn =
            company.janPrice *
              company.portfolioCompany.units *
              company.gainLoss -
            company.janPrice * company.portfolioCompany.units;

          return stockReturn;
        }),
      };
      // reduce() stockReturns into yearEndReturns using reducer fn above
    });

    // sort portfolios in descending order by yearEndReturn

    console.log("Portfolios:", portfolios);

    return res.json({ success: true, data: portfolios });
  } catch (error) {
    logError("Leaderboard data", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to get leaderboard data.",
    });
  }
};

module.exports = {
  addPortfolio,
  updatePortfolio,
  deletePortfolio,
  handleLeaderBoardData,
};
