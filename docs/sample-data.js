const ctx = document.getElementById("user-allocation").getContext("2d");

// Chart.defaults.global.defaultFontFamily = "Lato";
// Chart.defaults.global.defaultFontSize = 18;
// Chart.defaults.global.defaultFontColor = "#777";

const allocationPieChart = new Chart(ctx, {
  // is it possible to change the chart layout based on user input?
  type: "pie",
  data: {
    labels: ["$TSLA", "$GME", "$GOOGL", "$AMZN", "$FB", "$AMC"],
    datasets: [
      {
        label: "Stock Allocation",
        data: [200000, 100000, 400000, 50000, 200000, 50000],
        backgroundColor: ["green", "blue", "red", "yellow", "pink", "purple"],
        borderWidth: 1,
        borderColor: "#777",
        hoverBorderWidth: 3,
        hoverBorderColor: "#000",
      },
    ],
  },
  options: {
    title: {
      display: true,
      text: "Portfilio Allocation",
      fontSize: 25,
    },
  },
});
