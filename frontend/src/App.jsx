import React, {useState, useEffect, useRef} from 'react';
import urijs from 'urijs';
import PlantGroupSelect from '/src/PlantGroupSelect.jsx';
import "/css/compiled/styles.css";

const apiBaseUrl = "http://localhost:3000";

function App() {
    const [plants, setPlants] = useState([]);
    const [currentPlant, setCurrentPlant] = useState(null);
    const [isShowingPlantInfo, setIsShowingPlantInfo] = useState(false);
    const [currentFilter, setCurrentFilter] = useState("");
    const plantInfo = useRef();

    useEffect(() => {
        const dataUrl = new URL("data", apiBaseUrl);

        fetch(dataUrl.href)
          .then((res) => {
            return res.json();
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
        setIsShowingPlantInfo(false);
        setRandomPlant();
    }, [plants, currentFilter]);

    function showPlantInfo(){
        setIsShowingPlantInfo(true);
    }

    function filter(selectedFilter){
        setCurrentFilter(selectedFilter);  
    }

    function getFilteredPlants(groupName) {
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
                plants.length === 0 ? (
                    <div>All done!</div>
                )                
                : currentFilter !== "" && getFilteredPlants(currentFilter).length === 0 ? (
                    <div>All done with current filter.  Choose another group to continue: 
                        <PlantGroupSelect showBlank={true} onChange={filter} groups={getPlantGroupsAndCounts()} />
                    </div>                    
                )
                : currentPlant === null ? (
                    <p>Loading...</p>
                )
                : (
                    <div id="card-wrapper">
                        <button onClick={handleAdvance}>Advance</button>
                        <button onClick={handleCorrect}>Correct</button>
                        <PlantGroupSelect showBlank={false} onChange={filter} groups={getPlantGroupsAndCounts()} />
                        <div className={"plant-info" + (isShowingPlantInfo ? " unhidden" : "")} onClick={showPlantInfo}>
                            <p>{currentPlant.name}</p>
                            <em>{currentPlant.species}</em>
                            <p>{currentPlant.bloomTime}</p>            
                        </div>
                        <img className="plant-image" src={currentPlant.imageUrl} ref={plantInfo} />
                        <div>
                            {
                                currentFilter == "" ?
                                    <span>{plants.length} left</span> 
                                    : <span>{getFilteredPlants(currentFilter).length} left in group | {plants.length} total left</span>
                            }
                            
                        </div>
                    </div>
                )
            }
        </>
    ;
}

export default App;