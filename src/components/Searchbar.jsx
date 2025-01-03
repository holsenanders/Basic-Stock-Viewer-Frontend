import { useState, useCallback, useEffect } from "react";
import "./Searchbar.css";
import axios from "axios";
import StockGraph from "./StockGraph";

const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

const Searchbar = () => {
    const BASE_URL = "https://basicstockviewerbackend-ezf9eka8bzaqdyah.northeurope-01.azurewebsites.net";

    const [query, setQuery] = useState("AAPL");
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedStock, setSelectedStock] = useState({ ticker: "AAPL", name: "Apple Inc." });
    const [stockData, setStockData] = useState(null);
    const [currentInterval, setCurrentInterval] = useState("1Y");

    const fetchSuggestions = async (searchTerm) => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/api/stocks/search`, {
                params: {
                    query: searchTerm,
                },
            });

            setSuggestions(response.data || []);
        } catch (error) {
            console.error("Error fetching suggestions:", error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 300), []);

    const fetchStockData = async (stockTicker, interval) => {
        const now = new Date();
        const startDate = new Date();
        const endDate = now.toISOString().split("T")[0];

        switch (interval) {
            case "1M":
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case "3M":
                startDate.setMonth(startDate.getMonth() - 3);
                break;
            case "6M":
                startDate.setMonth(startDate.getMonth() - 6);
                break;
            case "1Y":
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            case "5Y":
                startDate.setFullYear(startDate.getFullYear() - 5);
                break;
            default:
                startDate.setFullYear(startDate.getFullYear() - 1);
        }

        try {
            const response = await axios.get(`${BASE_URL}/api/stocks/get_data`, {
                params: {
                    symbol: stockTicker,
                    start: startDate.toISOString().split("T")[0],
                    end: endDate,
                },
            });

            setStockData(response.data);
        } catch (error) {
            console.error("Error fetching stock data:", error);
        }
    };

    const handleStockSelect = async (stock) => {
        setSelectedStock(stock);
        setQuery(stock.ticker.toUpperCase());
        setSuggestions([]);
        setCurrentInterval("1Y");
        fetchStockData(stock.ticker, "1Y");
    };

    const handleIntervalChange = (interval) => {
        setCurrentInterval(interval);
        if (selectedStock) {
            fetchStockData(selectedStock.ticker, interval);
        }
    };

    useEffect(() => {
        fetchStockData("AAPL", "1Y");
    }, []);

    return (
        <div>
            {/* Searchbar */}
            <div className="searchbar-container">
                <input
                    type="text"
                    placeholder="Search stocks..."
                    value={query}
                    onChange={(e) => {
                        const value = e.target.value;
                        setQuery(value);
                        if (value.length > 2) {
                            debouncedFetchSuggestions(value);
                        } else {
                            setSuggestions([]);
                        }
                    }}
                    className="searchbar-input"
                />
                <ul className="searchbar-suggestions">
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            onClick={() => handleStockSelect(suggestion)}
                            className="searchbar-suggestion"
                        >
                            {suggestion.ticker} - {suggestion.name}
                        </li>
                    ))}
                </ul>
            </div>

            {selectedStock && (
                <div className="selected-stock-container">
                    <h3>Selected Stock: {selectedStock.name}</h3>
                </div>
            )}
            {stockData && (
                <div className="graph-container">
                    <StockGraph stockData={stockData} />
                    <div className="interval-buttons">
                        <button
                            onClick={() => handleIntervalChange("1M")}
                            disabled={currentInterval === "1M"}
                        >
                            1 Month
                        </button>
                        <button
                            onClick={() => handleIntervalChange("3M")}
                            disabled={currentInterval === "3M"}
                        >
                            3 Months
                        </button>
                        <button
                            onClick={() => handleIntervalChange("6M")}
                            disabled={currentInterval === "6M"}
                        >
                            6 Months
                        </button>
                        <button
                            onClick={() => handleIntervalChange("1Y")}
                            disabled={currentInterval === "1Y"}
                        >
                            1 Year
                        </button>
                        <button
                            onClick={() => handleIntervalChange("5Y")}
                            disabled={currentInterval === "5Y"}
                        >
                            5 Years
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Searchbar;
