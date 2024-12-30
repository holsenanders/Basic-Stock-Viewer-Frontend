import "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
} from "chart.js";
import "./StockGraph.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);

const StockGraph = ({ stockData }) => {
    if (!stockData) {
        return null;
    }

    if (Object.keys(stockData).length === 0) {
        return <p>No data available to display the graph.</p>;
    }

    const labels = Object.keys(stockData).reverse();
    const prices = Object.values(stockData)
        .map((data) => parseFloat(data["4. close"]))
        .reverse();

    const data = {
        labels,
        datasets: [
            {
                label: "Closing Price",
                data: prices,
                fill: false,
                borderColor: "rgba(75, 192, 192, 1)",
                tension: 0.1,
            },
        ],
    };

    return (
        <div className="stock-graph-container">
            <h3>Stock Price Graph</h3>
            <Line data={data} />
        </div>
    );
};

StockGraph.propTypes = {
    stockData: PropTypes.object,
};

export default StockGraph;
