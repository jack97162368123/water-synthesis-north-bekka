import React, {useEffect, useState, useRef, useMemo} from "react";
import Button from "@mui/material/Button";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Paper from "@mui/material/Paper";
import InfoIcon from "@mui/icons-material/Info";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {motion, AnimatePresence} from "framer-motion";
import {ResponsiveRadar} from "@nivo/radar";
import useMediaQuery from "@mui/material/useMediaQuery";
import {useTheme} from "@mui/material/styles";
import {LocalitiesData} from "../../data/LocalitiesData";
import {
    LocalitesWaterUsage2023,
    LocalitesWaterUsage2024,
    LocalitesWaterUsage2025,
    LocalitesWaterUsage2026,
} from "../../data/LocalitesWaterUsage2";
import Slider from "@mui/material/Slider";

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

const reversedPurpleBlue = [
    "#3DA9DE",
    "#2881B4",
    "#6BBDEE",
    "#5BAFD7",
    "#A2D9F2",
    "#3DA9DE",
    "#2881B4",
    "#6BBDEE",
].reverse();

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

const InteractivePoints = ({map, isZoomCompleted}) => {
    const [ selectedPoint, setSelectedPoint ] = useState(null);
    const hoveredPointIdRef = useRef(null);
    const [ displayKeys, setDisplayKeys ] = useState([ "2023", "2024", "2025", "2026" ]);
    const [ mapReady, setMapReady ] = useState(false);
    const [ infoOpen, setInfoOpen ] = useState(false);
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
    const [ isOpen, setIsOpen ] = useState(!isMobile);

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
        setDisplayKeys([ "2023", "2024", "2025", "2026" ]);
    };

    const transitionSettings = {duration: 1, ease: "easeInOut"};

    useEffect(() => {
        const handleMapLoad = () => {
            try {
                map.addSource("points", {
                    type: "geojson",
                    data: LocalitiesData,
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
                        const featureId = e.features[0].properties.id;
                        const data2023 = LocalitesWaterUsage2023.find((item) => item.id === featureId);
                        const data2024 = LocalitesWaterUsage2024.find((item) => item.id === featureId);
                        const data2025 = LocalitesWaterUsage2025.find((item) => item.id === featureId);
                        const data2026 = LocalitesWaterUsage2026.find((item) => item.id === featureId);
                        const localityData = LocalitiesData.features.find(
                            (feature) => feature.properties.id === featureId
                        );

                        if (data2023 && data2024 && data2025 && data2026 && localityData) {
                            setSelectedPoint({
                                ...localityData.properties,
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
            map?.on("load", handleMapLoad);
        }

        return () => {
            if (map) {
                map.off("mouseenter", "points");
                map.off("mouseleave", "points");
                map.off("click", "points");
                map.off("load", handleMapLoad);
                map.off("zoomend");

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

    useEffect(() => {
        if (isZoomCompleted && !isMobile) {
            setIsOpen(true);
        }
        else if (isMobile) {
            setIsOpen(false);
        }
    }, [ isZoomCompleted, isMobile ]);

    const toggleOpen = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsOpen((prevState) => !prevState);
    };

    const handleSliderChange = (event, newValue) => {
        setDisplayKeys([ newValue.toString() ]);
    };

    const toggleInfo = () => {
        setInfoOpen(!infoOpen);
    };

    useEffect(() => {
        const defaultLocalityId = 1;

        const defaultLocalityData = LocalitiesData.features.find(
            (feature) => feature.properties.id === defaultLocalityId
        );

        if (defaultLocalityData) {
            const data2023 = LocalitesWaterUsage2023.find((item) => item.id === defaultLocalityId);
            const data2024 = LocalitesWaterUsage2024.find((item) => item.id === defaultLocalityId);
            const data2025 = LocalitesWaterUsage2025.find((item) => item.id === defaultLocalityId);
            const data2026 = LocalitesWaterUsage2026.find((item) => item.id === defaultLocalityId);

            setSelectedPoint({
                ...defaultLocalityData.properties,
                data2023: data2023 ? data2023 : {},
                data2024: data2024 ? data2024 : {},
                data2025: data2025 ? data2025 : {},
                data2026: data2026 ? data2026 : {},
            });
        }
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <div
                className="interactive-points"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    top: "10px",
                    right: "10px",
                    zIndex: 3,
                    position: "absolute",
                }}
            >
                <AnimatePresence>
                    {isZoomCompleted && (
                        <motion.button
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={transitionSettings}
                            onClick={toggleOpen} // Toggle isOpen
                            style={{
                                backgroundColor: theme.palette.primary.main,
                                color: "#fff",
                                padding: "10px",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                marginBottom: "10px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                textTransform: "uppercase",
                                fontWeight: "500",
                                width: isMobile ? "45vw" : "20vw",
                            }}
                        >
                            {isOpen ? (
                                <motion.div
                                    key="hide"
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    exit={{opacity: 0}}
                                    transition={{duration: 0.2}}
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <ChevronRightIcon /> Localities Data
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="show"
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    exit={{opacity: 0}}
                                    transition={{duration: 0.2}}
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <ChevronLeftIcon /> Localities Data
                                </motion.div>
                            )}
                        </motion.button>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isOpen && isZoomCompleted && (
                        <motion.div
                            key="panel" // key that reflects the presence of the element
                            initial={{x: 300, opacity: 0}}
                            animate={{x: 0, opacity: 1}}
                            exit={{x: 300, opacity: 0}}
                            transition={{duration: 1, ease: "easeInOut"}}
                        >
                            <Paper
                                elevation={4}
                                sx={{
                                    padding: "10px",
                                    height: isMobile ? "90vh" : "80vh", // Dynamic width based on device
                                    display: "flex",
                                    flexDirection: "column",
                                    zIndex: 1,
                                    width: isMobile ? "90vw" : "25vw", // Dynamic width based on device
                                }}
                            >

                                
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        margin: "0px",
                                    }}
                                >
                                    <motion.h2
                                        initial={{opacity: 0}}
                                        animate={{opacity: 1, transition: {delay: 0.6}}}
                                        exit={{opacity: 0}}
                                        style={{marginTop: "5px", marginBottom: "0px"}}
                                    >
                                        {selectedPoint?.title}
                                    </motion.h2>
                                    <Tooltip title="About this widget">
                                        <IconButton onClick={toggleInfo}>
                                            <InfoIcon />
                                        </IconButton>
                                    </Tooltip>
                                </div>

                                <Dialog open={infoOpen} onClose={toggleInfo}>
                                    <DialogTitle>About the Widget</DialogTitle>
                                    <DialogContent>
                                        <DialogContentText>
                                            This widget allows you to explore water usage data across different
                                            localities. Select a locality on the map to see detailed metrics.
                                        </DialogContentText>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={toggleInfo} color="primary">
                                            Close
                                        </Button>
                                    </DialogActions>
                                </Dialog>

                                {selectedPoint && (
                                    <motion.div
                                        key={selectedPoint.id}
                                        initial={{opacity: 0, y: -20}}
                                        animate={{opacity: 1, y: 0, transition: {delay: 0.5, duration: 0.5}}}
                                        exit={{opacity: 0, y: 20, transition: {duration: 0.5}}}
                                    >
                                
                                        <motion.p
                                            initial={{opacity: 0}}
                                            animate={{opacity: 1, transition: {delay: 0.7}}}
                                            exit={{opacity: 0}}
                                            style={{marginTop: "5px", marginBottom: "0px", fontSize: "1.3em"}}
                                        >
                                            {selectedPoint?.description}
                                        </motion.p>
                                    </motion.div>
                                )}

                                <div style={{flex: 1, minHeight: 0, zIndex: 1}}>
                                    {selectedPoint && (
                                        <ResponsiveRadar
                                            data={radarData}
                                            keys={displayKeys}
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
                                            enableDotLabel={false}
                                            dotLabel="value"
                                            dotLabelYOffset={-12}
                                            colors={reversedPurpleBlue}
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
                                        disabled={!mapReady}
                                    />
                                </div>
                                <div style={{marginTop: "10px"}}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={resetFilter}
                                        style={{width: "100%"}}
                                    >
                                        Reset Filter
                                    </Button>
                                </div>
                            </Paper>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ThemeProvider>
    );
};

export default InteractivePoints;
