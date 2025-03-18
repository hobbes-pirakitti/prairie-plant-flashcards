import React, {useState, useEffect} from 'react';
import urijs from 'urijs';

const apiBaseUrl = "http://localhost:3000";

function App() {
    const [plants, setPlants] = useState([]);
    const [currentPlant, setCurrentPlant] = useState({});

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
        const index = Math.floor(Math.random() * plantList.length);
        setCurrentPlant(plantList[index]);
    }

    return <>
            <img src={currentPlant.imageUrl} />
            <div>
                <p>{currentPlant.name}</p>
                <em>{currentPlant.species}</em>
                <p>{currentPlant.bloomTime}</p>            
            </div>
            <button onClick={() => {showRandom(plants)}}>Next</button>
        </>
    ;
}

export default App;