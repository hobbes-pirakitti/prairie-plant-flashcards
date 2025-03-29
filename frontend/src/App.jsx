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

function App() {
    const [plants, setPlants] = useState([]);
    const [currentPlant, setCurrentPlant] = useState(null);
    const [hasShownPlantInfo, setHasShownPlantInfo] = useState(false);
    const [isRevealingPlantInfo, setIsRevealingPlantInfo] = useState(false);
    const [currentFilter, setCurrentFilter] = useState("");
    const [serverError, setServerError] = useState("");
    const plantInfo = useRef();
    const isDesktop = !isMobile({ tablet: true });

    useEffect(() => {
        const dataUrl = new URL("data", apiBaseUrl);

        fetch(dataUrl.href)
          .then((res) => {
            return res.json();
          })
          .catch((e) => {
            console.error(e.message);
            setServerError(e.message);
            return Promise.reject(e);
          })
          .then((plantGroups) => {
            console.log(plantGroups);
            const allPlants = [];
            for (const plantGroup of plantGroups) {
                for (const plant of plantGroup.plants) {
                    plant.group = plantGroup.group;
                    plant.imageUrl = apiBaseUrl + urijs.joinPaths("/image", plant.image).href();
                    allPlants.push(plant);
                }
            }
            console.log(`Got ${allPlants.length} plants.`);
            setPlants(allPlants);
          });
      }, []);

    useEffect(() => {
        if (plants.length === 0) {
            console.log("No plants (1)");
            return;
        }
        setHasShownPlantInfo(false);
        setIsRevealingPlantInfo(false);
        setRandomPlant();
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

    function filter(selectedFilter){
        setCurrentFilter(selectedFilter);  
    }

    function getFilteredPlants(groupName) {        
        if (groupName === "" || groupName === undefined || groupName === null) {
            return plants;
        }
        return plants.filter(p =>p.group === groupName);
    }

    function setRandomPlant() {
        let newPlant = null;
        if (currentFilter === "" || currentFilter === undefined || currentFilter === null) {
            const index = Math.floor(Math.random() * plants.length);
            newPlant = plants[index];
        }
        else {
            const filteredPlants = getFilteredPlants(currentFilter);
            if (filteredPlants.length === 0) {
                console.log("No filtered plants (1)");
                return;
            }            
            
            const filteredIndex = Math.floor(Math.random() * filteredPlants.length);
            newPlant = filteredPlants[filteredIndex];
        }
        
        setCurrentPlant(newPlant);
    }

    function handleAdvance() {
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
        // deduplicate group names with Set
        return Array.from(new Set(plants.map(p => p.group))).map(groupName => ({
            Name: groupName,
            Count: getFilteredPlants(groupName).length
        }));
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
                    <div id="all-done-group">All done with {currentFilter}.  Choose another group to continue: 
                        <PlantGroupSelect selectedValue={currentFilter} showBlank={true} onChange={filter} groups={getPlantGroupsAndCounts()} />
                    </div>                    
                )
                : currentPlant === null ? (
                    <p>Loading...</p>
                )
                : (
                    <div id="card-wrapper">
                        <div id="flex-wrapper">
                            <div id="button-wrapper">
                                <button onClick={handleAdvance} disabled={!hasShownPlantInfo || isRevealingPlantInfo}>
                                    {
                                        isDesktop ? 
                                        <span><u>A</u>dvance</span> : 
                                        <span>Advance</span>
                                    }
                                </button>
                                <button onClick={handleCorrect} disabled={!hasShownPlantInfo || isRevealingPlantInfo}>
                                    {
                                        isDesktop ? 
                                        <span><u>C</u>orrect</span> : 
                                        <span>Correct</span>
                                    }
                                </button>
                            </div>
                            <PlantGroupSelect selectedValue={currentFilter} showBlank={false} onChange={filter} groups={getPlantGroupsAndCounts()} />
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