import React, {useEffect, useState, useRef, useMemo} from "react";
import Button from "@mui/material/Button";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Slide from "@mui/material/Slide";
import Paper from "@mui/material/Paper";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {motion} from "framer-motion";
import {ResponsiveRadar} from "@nivo/radar";
import {LocalitiesData} from "../../data/LocalitiesData";
import {LocalitesWaterUsage2023, LocalitesWaterUsage2024, LocalitesWaterUsage2025, LocalitesWaterUsage2026} from "../../data/LocalitesWaterUsage2";
import Slider from "@mui/material/Slider";
import {useMediaQuery} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import "./Interactive.css";

// Set the theme for the MUI components
const theme = createTheme({
    typography: {
        fontFamily: '"inter", sans-serif !important',
    },

    palette: {
        primary: {
            main: "#3498db",
        },
    },
});

const marks = [
    {
        value: 2023,
        label: "2023",
    },
    {
        value: 2024,
        label: "2024",
    },

    {
        value: 2025,
        label: "2025",
    },
    {
        value: 2026,
        label: "2026",

    },
];

const InteractivePoints = ({map}) => {
    const [ selectedPoint, setSelectedPoint ] = useState(null);
    const hoveredPointIdRef = useRef(null);
    const [ isOpen, setIsOpen ] = useState(false);
    const [ displayKeys, setDisplayKeys ] = useState([ "2023", "2024", "2025", "2026" ]);
    const [ mapReady, setMapReady ] = useState(false); // New state variable to control interaction

    const handleYearFilter = (year) => {
        setDisplayKeys([ year ]); // Set the display keys to the selected year
    };

    const paperStyle = {
        padding: "10px",
        width: "25vw", // Default width for larger devices
        height: "50vh",
        display: "flex",
        flexDirection: "column",
        pointerEvents: "auto",
        // Add a media query for devices with a max-width of 768px
        "@media (max-width: 768px)": {
            width: "90vw", // 90% of the viewport width on smaller devices
        },
    };

    const getCorrespondingDataForLocality = (localityId) => {
        const data2023 = LocalitesWaterUsage2023.find((item) => item.id === localityId);
        const data2024 = LocalitesWaterUsage2024.find((item) => item.id === localityId);
        const data2025 = LocalitesWaterUsage2025.find((item) => item.id === localityId);
        const data2026 = LocalitesWaterUsage2026.find((item) => item.id === localityId);

        if (data2023 && data2024) {
            return [
                {
                    metric: "Water Demand m3/day",
                    2023: data2023.waterDemand,
                    2024: data2024.waterDemand,
                    2025: data2025.waterDemand,
                    2026: data2026.waterDemand,

                },
                {
                    metric: "Water Produced m3/day",
                    2023: data2023.averageProducedWater,
                    2024: data2024.averageProducedWater,
                    2025: data2025.averageProducedWater,
                    2026: data2026.averageProducedWater,
                },
                {
                    metric: "Available Water Source m3/day",
                    2023: data2023.availableWaterSource,
                    2024: data2024.availableWaterSource,
                    2025: data2025.availableWaterSource,
                    2026: data2026.availableWaterSource,
                },
            ];
        }

        return [];
    };

    const radarData = useMemo(() => getCorrespondingDataForLocality(selectedPoint?.id), [ selectedPoint, displayKeys ]);

    const resetFilter = () => {
        setDisplayKeys([ "2023", "2024", "2025", "2026", ]); // Reset the display keys to show all data
    };

    const transitionSettings = { duration: 1, ease: "easeInOut" };


    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    useEffect(() => {
        if (!map) return;

        const handleMapLoad = () => {
            try {
                map.addSource("points", {
                    type: "geojson",
                    data: LocalitiesData, // Use the data object here
                });

                map.on("zoomend", () => {
                    setMapReady(true);
                });

                map.addLayer({
                    id: "points",
                    type: "circle",
                    source: "points",
                    paint: {
                        "circle-radius": 6,
                        "circle-color": "#3498db",
                    },
                });

                map.on("mouseenter", "points", (e) => {
                    map.getCanvas().style.cursor = "pointer";
                    if (e.features.length > 0) {
                        const {id} = e.features[0].properties;
                        hoveredPointIdRef.current = id;
                    }
                });

                map.on("mouseleave", "points", () => {
                    map.getCanvas().style.cursor = "";
                    hoveredPointIdRef.current = null;
                });

                map.on("click", "points", (e) => {
                    if (e.features.length > 0) {
                        const featureId = e.features[0].properties.id; // Retrieve ID from the clicked feature properties
                        const data2023 = LocalitesWaterUsage2023.find((item) => item.id === featureId);
                        const data2024 = LocalitesWaterUsage2024.find((item) => item.id === featureId);
                        const data2025 = LocalitesWaterUsage2025.find((item) => item.id === featureId);
                        const data2026 = LocalitesWaterUsage2026.find((item) => item.id === featureId);
                        const localityData = LocalitiesData.features.find(
                            (feature) => feature.properties.id === featureId
                        );

                        if (data2023 && data2024 && data2025 && data2026 && localityData) {
                            setSelectedPoint({
                                // Merge data for both years along with the locality data
                                ...localityData.properties, // This contains title and description
                                data2023: {
                                    waterDemand: data2023.waterDemand,
                                    averageProducedWater: data2023.averageProducedWater,
                                    availableWaterSource: data2023.availableWaterSource,
                                },
                                data2024: {
                                    waterDemand: data2024.waterDemand,
                                    averageProducedWater: data2024.averageProducedWater,
                                    availableWaterSource: data2024.availableWaterSource,
                                },
                                data2025: {
                                    waterDemand: data2025.waterDemand,
                                    averageProducedWater: data2025.averageProducedWater,
                                    availableWaterSource: data2025.availableWaterSource,
                                },
                                data2026: {
                                    waterDemand: data2026.waterDemand,
                                    averageProducedWater: data2026.averageProducedWater,
                                    availableWaterSource: data2026.availableWaterSource,
                                },
                            });
                        }
                    }
                });
            } catch (error) {
                console.error("Error adding source and layer:", error);
            }
        };

        if (map && map.isStyleLoaded()) {
            handleMapLoad();
        }
        else {
            // Only attach the load event listener if the map is not yet loaded
            map?.on("load", handleMapLoad);
        }

        // Cleanup function
        return () => {
            if (map) {
                // Remove event listeners
                map.off("mouseenter", "points");
                map.off("mouseleave", "points");
                map.off("click", "points");
                map.off("load", handleMapLoad); // Remove this line if 'load' event is not being used elsewhere
                map.off("zoomend");

                // Use try-catch to avoid errors when removing layers or sources that might not exist
                try {
                    if (map.getLayer("points")) {
                        map.removeLayer("points");
                    }
                    if (map.getSource("points")) {
                        map.removeSource("points");
                    }
                } catch (error) {
                    console.error("Error removing layer or source:", error);
                }
            }
        };
    }, [ map ]);

    // Modify the toggleOpen function to handle event stopping
    const toggleOpen = (event) => {
        event.preventDefault(); // Prevent default event behavior
        event.stopPropagation(); // Stop event propagation
        setIsOpen(!isOpen);
    };

    const handleSliderChange = (event, newValue) => {
        setDisplayKeys([ newValue.toString() ]); // Ensure the year is a string if your data keys are strings
    };

    return (
        <ThemeProvider theme={theme}>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    top: "10px",
                    right: "10px",
                    zIndex: 1000,
                }}
            >
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={transitionSettings}
                    onClick={toggleOpen}
                    style={{
                        backgroundColor: theme.palette.primary.main,
                        color: "#fff",
                        padding: "10px 20px",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        marginBottom: "20px", // Add a margin at the bottom of the button
                        width: "26.5vw", // Fixed width for the button
                        textAlign: "center",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        textTransform: "uppercase",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        position: "absolute", // Set the position to absolute
                        top: "10px", // Adjust the top position as needed
                        right: "10px", // Adjust the right position as needed
                        zIndex: 1000,
                    }}
                >
                    {isMobile ? (
                        <MenuIcon />
                    ) : (
                        <>
                            {isOpen ? "Close " : "Open "}
                            {isOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                        </>
                    )}
                </motion.button>

                <Slide direction="right" in={isOpen} mountOnEnter unmountOnExit>
                    <motion.div
                        initial={{ x: 600, opacity: 0 }}
                        animate={isOpen ? { x: 0, opacity: 1 } : { x: 600, opacity: 0 }}
                        transition={{duration: 1, ease: "easeInOut"}}
                    >
                        <Paper
                            elevation={4}
                            sx={{
                                padding: "10px",
                                width: {
                                    xs: "90vw", // on extra-small screens (mobile)
                                    md: "25vw", // on medium screens (desktop) and above
                                },
                                height: "50vh",
                                display: "flex",
                                flexDirection: "column",
                                pointerEvents: "auto",
                                marginTop: "65px", // Adjust the margin top as needed
                                marginRight: "10px",
                                zIndex: 1000,
                            }}
                        >
                            <h2 style={{marginTop: "10px", marginBottom: "5px"}}>Click on a localitie to see data</h2>
                            <h4 style={{marginTop: "5px", marginBottom: "0px", fontSize: "1em"}}>
                                {selectedPoint?.title}
                            </h4>
                            <p style={{marginTop: "5px", marginBottom: "0px", fontSize: "1em"}}>
                                {selectedPoint?.description}
                            </p>
                            <div style={{flex: 1, minHeight: 0, zIndex: 1000,}}>
                                {" "}
                                {/* This div will grow to fit available space */}
                                {selectedPoint && (
                                    <ResponsiveRadar
                                        data={radarData}
                                        keys={displayKeys} // Use the state variable here
                                        indexBy="metric"
                                        maxValue="auto"
                                        margin={{top: 50, right: 80, bottom: 40, left: 80}}
                                        padding={{right: 10, left: 10}}
                                        curve="linearClosed"
                                        borderWidth={2}
                                        borderColor={{from: "color"}}
                                        gridLevels={5}
                                        gridShape="circular"
                                        gridLabelOffset={10}
                                        enableDots={true}
                                        dotSize={10}
                                        dotColor={{theme: "background"}}
                                        dotBorderWidth={2}
                                        dotBorderColor={{from: "color"}}
                                        enableDotLabel={true}
                                        dotLabel="value"
                                        dotLabelYOffset={-12}
                                        colors={{scheme: "spectral"}} // This uses one of Nivo's predefined color schemes
                                        fillOpacity={0.25}
                                        blendMode="multiply"
                                        animate={true}
                                        motionStiffness={90}
                                        motionDamping={15}
                                        isInteractive={true}
                                        
                                    />
                                )}
                            </div>

                            <div style={{padding: "0 20px"}}>
                                <Slider
                                    defaultValue={2023}
                                    step={1}
                                    marks={marks}
                                    min={2023}
                                    max={2026}
                                    valueLabelDisplay="auto"
                                    onChangeCommitted={handleSliderChange}
                                    disabled={!mapReady} // Disable the slider if the map is not ready
                                />
                            </div>

                            <div style={{padding: "0 20px", marginTop: "10px"}}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={resetFilter}
                                    style={{width: "100%"}} // You can adjust the width as needed
                                >
                                    Reset
                                </Button>
                            </div>
                        </Paper>
                    </motion.div>
                </Slide>
            </div>
        </ThemeProvider>
    );
};

export default InteractivePoints;
