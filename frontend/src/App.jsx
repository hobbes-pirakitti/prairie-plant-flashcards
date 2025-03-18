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

    return <div id="card-wrapper">
            <img className="plant-image" src={currentPlant.imageUrl} ref={plantInfo} />
            <div className={"plant-info" + (isShowingPlantInfo ? " unhidden" : "")} onClick={showPlantInfo}>
                <p>{currentPlant.name}</p>
                <em>{currentPlant.species}</em>
                <p>{currentPlant.bloomTime}</p>            
            </div>
            <button onClick={() => {showRandom(plants)}}>Next</button>
        </div>
    ;
}

export default App;