//get view more btn
const companiesContainer = $("#companies-container");

const constructPortfolioOptions = (portfolios) => {
  return portfolios
    .map((portfolio) => {
      return `<option id="${portfolio.id}" value="${portfolio.name} || $${portfolio.remaining_budget}">${portfolio.name} || $${portfolio.remaining_budget}</option>`;
    })
    .join("");
};

const constructCompanyModal = ({ company, portfolios }) => {
  return `<div class="modal fade" id="company-card-modal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-purple text-white">
          <h5 class="modal-title" id="company-name">${company.name}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <h6 class="card-subtitle">${company.sector}</h6>
          <p>${company.symbol}</p>
          <p>January 2021 share price: <span>${company.janPrice}</span></p>
          <p>${company.company_summary}</p>
        </div>
        <form id="${company.id}" data-sharePrice="${
    company.janPrice
  }" name="add-company-form">
          <div class="modal-footer d-flex justify-content-between">
            <div>
              <label for="number-shares"> Number of shares:</label>
              <input type="text" name="" id="number-shares" />
            </div>
            <div>
              <label for="portfolio-name">Select a portfolio:</label>
              <select name="portfolio-name" id="portfolio-name">
                ${constructPortfolioOptions(portfolios)}
              </select>
            </div>
            <div>
              <button type="submit"  class="btn btn-secondary">Add to
                portfolio</button>
            </div>
            <div id="stocks-error"></div>
          </div>
        </form>
      </div>
    </div>
  </div>`;
};

// CK: 21/01/2022 - for some reason the click is cycling through the array of companies instead of making the API request for each company
const renderStockInfoModal = async (event) => {
  const target = event.target;

  if ($(target).is('button[name="view-company"]')) {
    if ($("#company-card-modal").length) {
      $("#company-card-modal").remove();
    }

    const companyId = $(target).attr("id");

    // make API request
    const response = await fetch(`/api/companies/${companyId}`);

    const { data } = await response.json();

    const companyModal = constructCompanyModal(data);

    companiesContainer.append(companyModal);
    $("#company-card-modal").modal("show");
    $("[name='add-company-form']").on("submit", addCompanyToPortfolio);
  }
};

//event listener on company modal
const addCompanyToPortfolio = async (event) => {
  event.preventDefault();
  const target = event.target;

  const companyId = $(target).attr("id");

  const sharePrice = $(target).attr("data-sharePrice");

  const numberShares = $("#number-shares").val();

  const portfolioId = $("#portfolio-name option:selected").attr("id");

  // get the portfolioId and make a request to the back end
  const portfolioApiResponse = await fetch(`/api/portfolios/${portfolioId}`);

  const { data } = await portfolioApiResponse.json();

  if (data) {
    const totalSpend = sharePrice * numberShares;
    const remaining_budget = parseInt(data.remaining_budget);

    if (remaining_budget < totalSpend) {
      $("#stocks-error").text("");
      $("#stocks-error").text("Not enough funds available!");
    } else {
      const postResponse = await fetch("/api/portfolio-company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          portfolio_id: portfolioId,
          units: numberShares,
          company_id: companyId,
        }),
      });

      const { success, companyExists } = await postResponse.json();

      if (success) {
        const putResponse = await fetch(`/api/portfolios/${portfolioId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            units: numberShares,
            unit_cost: sharePrice,
          }),
        });
        $("#company-card-modal").modal("hide");
        return;
      }

      if (companyExists) {
        $("#stocks-error").text("");
        $("#stocks-error").text("Company already exists in portfolio");
      }
    }
  }
};

//event on view more btn
companiesContainer.on("click", renderStockInfoModal);
