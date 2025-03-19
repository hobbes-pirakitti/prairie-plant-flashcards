import React, {useState, useEffect, useRef} from 'react';
import urijs from 'urijs';
import "/css/compiled/styles.css";

const apiBaseUrl = "http://localhost:3000";

function App() {
    const [plants, setPlants] = useState([]);
    const [currentPlant, setCurrentPlant] = useState({});
    const [isShowingPlantInfo, setIsShowingPlantInfo] = useState(false);
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
            setPlants(allPlants);
            return allPlants;
          }).then((allPlants) => {
            showRandom(allPlants);
          });
      }, []);

    function showRandom(plantList) {
        setIsShowingPlantInfo(false);
        const index = Math.floor(Math.random() * plantList.length);
        setCurrentPlant(plantList[index]);
    }

    function showPlantInfo(){
        setIsShowingPlantInfo(true);
    }

    function removeCurrent() {
        setPlants(plants.filter(p => p.name !== currentPlant.name));
    }

    function filter(plants, selection){
        if (selection === "") {
            showRandom(plants);    
        }
        else {
            showRandom(plants.filter(p => p.group === selection));
        }
    }

    return <>
            { plants.length > 0 && (
                <div id="card-wrapper">
                    <button onClick={() => {showRandom(plants);}}>Advance</button>
                    <button onClick={() => {removeCurrent();showRandom(plants);}}>Correct</button>
                    <select name="groupFilter" onChange={(e) => filter(plants, e.target.value)}>
                        <option key="None" name="">None ({plants.length})</option>
                        {
                            Array.from(new Set(plants.map(p=>p.group))).map(groupName => 
                                <option key={groupName} value={groupName}>{groupName}&nbsp;({plants.filter(p =>p.group === groupName).length})</option>
                            )
                        }
                    </select>
                    <div className={"plant-info" + (isShowingPlantInfo ? " unhidden" : "")} onClick={showPlantInfo}>
                        <p>{currentPlant.name}</p>
                        <em>{currentPlant.species}</em>
                        <p>{currentPlant.bloomTime}</p>            
                    </div>
                    <img className="plant-image" src={currentPlant.imageUrl} ref={plantInfo} />
                    <div>{plants.length} left</div>
                </div>
                )
            }
            { plants.length == 0 && (
                <div>All done!</div>
                )
            }
        </>
    ;
}

export default App;