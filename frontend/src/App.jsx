import React, {useState, useEffect, useRef} from 'react';
import urijs from 'urijs';
import isMobile from 'is-mobile';

// note that this line needs to be fixed in the package:  
//  "module": "./lib/index.esm.js",
import { useKeyPress } from '@rsxt/keypress';

import classNames from 'classnames';
import PlantGroupSelect from '/src/PlantGroupSelect.jsx';
import "/css/reset.css";
import "/css/compiled/styles.css";

const apiBaseUrl = "https://172.16.0.254:3000";

const allFilterableAttributes = ["bloomColor", "family"];

const filterDisplayNameMap = new Map();
filterDisplayNameMap.set("bloomColor", "Bloom color");
filterDisplayNameMap.set("family", "Family");

const filterLambdaGeneratorMap = new Map();
filterLambdaGeneratorMap.set("bloomColor", (bloomColorName) => (p => p.filterAttributes.bloomColor === bloomColorName));
filterLambdaGeneratorMap.set("family", (familyName) => (p => p.filterAttributes.family === familyName));

function App() {
    const [plants, setPlants] = useState([]);
    const [currentPlant, setCurrentPlant] = useState(null);
    const [hasShownPlantInfo, setHasShownPlantInfo] = useState(false);
    const [isRevealingPlantInfo, setIsRevealingPlantInfo] = useState(false);
    const [currentFilter, setCurrentFilter] = useState(""); // pipe-separated, eg, "family|Asteraceae"
    const currentFilterDisplayName = useRef("");    
    const [serverError, setServerError] = useState("");
    const plantInfo = useRef();
    const otherAdvanceHotspot = useRef(null);
    const isDesktop = !isMobile({ tablet: true });

    useEffect(() => {
        const plantsDataUrl = new URL("plants", apiBaseUrl);

        fetch(plantsDataUrl.href)
          .then((res) => {
            return res.json();
          })
          .catch((e) => {
            console.error(e.message);
            setServerError(e.message);
            return Promise.reject(e);
          })
          .then((apiPlants) => {
            console.log(apiPlants);
            for (const apiPlant of apiPlants) {
                apiPlant.imageUrl = apiBaseUrl + urijs.joinPaths("/image", apiPlant.image).href();
                apiPlant.filterAttributes = {
                    bloomColor: apiPlant.bloomColor,
                    family: apiPlant.family
                };
            }
            setPlants(apiPlants);
          });
      }, []);

    useEffect(() => {
        if (plants.length === 0) {
            console.log("No plants (1)");
            return;
        }
        resetUI();
    }, [plants, currentFilter]);

    useKeyPress(() => {
        if (hasShownPlantInfo) {
            handleAdvance();
        }
    }, [{keys:['a','A']}]);
    useKeyPress(() => {
        if (hasShownPlantInfo) {
            handleCorrect();
        }
    }, [{keys:['c','C']}]);
    useKeyPress(() => {
        showPlantInfo();
    }, [{keys:['r','R']}]); 

    function showPlantInfo(){
        setIsRevealingPlantInfo(true);

        window.setTimeout(() => {
            setIsRevealingPlantInfo(false);
            setHasShownPlantInfo(true);
        }, isDesktop ? 1500 : 1000);
    }

    function handleDropdownFilterChange(selectedFilter){
        if (!!!selectedFilter) {
            currentFilterDisplayName.current = "";
            setCurrentFilter("");
        }

        const [attributeName, attributeValue] = selectedFilter.split("|");
        
        currentFilterDisplayName.current = `${filterDisplayNameMap.get(attributeName)}: ${attributeValue}`;
        setCurrentFilter(selectedFilter);  
    }

    function getFilteredPlants(pipeSeparatedFilter) {        
        if (!!!pipeSeparatedFilter) {
            return plants;
        }

        const [attributeName, attributeValue] = pipeSeparatedFilter.split("|");
        const filterLambda = filterLambdaGeneratorMap.get(attributeName)(attributeValue);
        return plants.filter(filterLambda);
    }

    function setRandomPlant() {
        let newPlant = null;

        if (plants.length === 1) {
            setCurrentPlant(plants[0]);
            return;
        }        

        if (!!currentFilter && getFilteredPlants(currentFilter).length == 1) {
            setCurrentPlant(getFilteredPlants(currentFilter)[0]);
            return;
        }

        if (!!!currentFilter) {
            while(newPlant === null || (currentPlant !== null && newPlant.name == currentPlant.name)) {
                const index = Math.floor(Math.random() * plants.length);
                newPlant = plants[index];
            }
        }
        else {
            const filteredPlants = getFilteredPlants(currentFilter);
            if (filteredPlants.length === 0) {
                console.log("No filtered plants (1)");
                return;
            }            
            
            while(newPlant === null || (currentPlant !== null && newPlant.name == currentPlant.name)) {
                const filteredIndex = Math.floor(Math.random() * filteredPlants.length);
                newPlant = filteredPlants[filteredIndex];
            }
        }
        
        setCurrentPlant(newPlant);
    }

    function handleAdvance() {
        resetUI();
    }

    function otherAdvanceHotspotClick(e) {    
        e.target.classList.toggle('hover');
    }

    function handleShortlist() {
        resetUI();
    }

    function resetUI() {
        if (otherAdvanceHotspot && otherAdvanceHotspot.current) {
            otherAdvanceHotspot.current.classList.remove('hover');
        }
        setHasShownPlantInfo(false);
        setIsRevealingPlantInfo(false);
        setRandomPlant();
    }

    function handleCorrect() {
        /*
        // warning!  two effects here        
        setPlants(plants.filter(p => p.name !== currentPlant.name));
        const newIndex = getRandomIndex();
        setCurrentIndex(newIndex);
        */

        /*
        // error:
        // State updates from the useState() and useReducer() Hooks don't support the second callback argument. 
        // To execute a side effect after rendering, declare it in the component body with useEffect().
        setPlants(
            plants.filter(p => p.name !== currentPlant.name),
            () => {
                const newIndex = getRandomIndex();
                setCurrentIndex(newIndex);
            }
        ); 
        */
       
        setPlants(plants.filter(p => p.name !== currentPlant.name));
    }

    function getPlantGroupsAndCounts() {
        return allFilterableAttributes.map(filterName => {                        
            return {
                AttributeDisplayName: filterDisplayNameMap.get(filterName),
                
                // deduplicate group names with Set
                AttributeValues: Array.from(new Set(plants.map(p => p.filterAttributes[filterName]))).map(filterValue => ({
                    DisplayName: filterValue,
                    FilterExpression: `${filterName}|${filterValue}`,
                    Count: getFilteredPlants(`${filterName}|${filterValue}`).length
                }))
            };
        });
    }            

    return <>
            {               
                serverError !== null && serverError !== "" ? (
                    <div id="server-error">
                    	<p>There was an error on this page.  Please try again.</p>
                    	<p>{serverError}</p>
                        <p>
                            May need to allow&nbsp;
                            <a target="_blank" href={apiBaseUrl}>
                                this page
                            </a>.
                        </p>
                    </div>
                )  
                : plants.length === 0 ? (
                    <div id="all-done">All done!</div>
                )                
                : currentFilter !== "" && getFilteredPlants(currentFilter).length === 0 ? (
                    <div id="all-done-group">
                        All done with <em>{currentFilterDisplayName.current}</em>.
                        Choose another group to continue:
                        <PlantGroupSelect selectedValue={currentFilter} showBlank={true} onChange={handleDropdownFilterChange} groups={getPlantGroupsAndCounts()} />
                    </div>                    
                )
                : currentPlant === null ? (
                    <p>Loading...</p>
                )
                : (
                    <div id="card-wrapper">
                        <div id="flex-wrapper">
                            <div id="button-wrapper">
                                <div id="advance-action-wrapper">
                                    <button onClick={handleAdvance} disabled={!hasShownPlantInfo || isRevealingPlantInfo}>
                                        {
                                            isDesktop ? 
                                            <span><u>A</u>dvance</span> : 
                                            <span>Advance</span>
                                        }
                                    </button>
                                    <div id="other-advance-actions-hotspot" ref={otherAdvanceHotspot} onClick={otherAdvanceHotspotClick} disabled={!hasShownPlantInfo || isRevealingPlantInfo}>
                                        
                                    </div>
                                    <ul id="other-advance-actions">
                                        <li>
                                            <button onClick={handleShortlist}>
                                                {
                                                    isDesktop ? 
                                                    <span><u>S</u>hortlist</span> : 
                                                    <span>Shortlist</span>
                                                }
                                            </button>                                            
                                        </li>
                                    </ul>
                                </div>
                                <button onClick={handleCorrect} disabled={!hasShownPlantInfo || isRevealingPlantInfo}>
                                    {
                                        isDesktop ? 
                                        <span><u>C</u>orrect</span> : 
                                        <span>Correct</span>
                                    }
                                </button>
                            </div>
                            <PlantGroupSelect selectedValue={currentFilter} showBlank={false} onChange={handleDropdownFilterChange} groups={getPlantGroupsAndCounts()} />
                            <div className={classNames("plant-info", {
                                    'unhidden': hasShownPlantInfo || isRevealingPlantInfo,
                                    'is-desktop': isDesktop
                                })} onClick={showPlantInfo}>
                                <p className="plant-name">{currentPlant.name}</p>

                                <p className="family">{currentPlant.family}</p>
                                <em className="species">{currentPlant.species}</em>
                                <p className="bloom-time">{currentPlant.bloomTime}</p>            
                            </div>
                            <div id="image-and-stats-wrapper">
                                <img className="plant-image" src={currentPlant.imageUrl} ref={plantInfo} />
                                <div>
                                    {
                                        currentFilter == "" ?
                                            <span>{plants.length} left</span> 
                                            : <span>{getFilteredPlants(currentFilter).length} left in group | {plants.length} total left</span>
                                    }
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    ;
}

export default App;