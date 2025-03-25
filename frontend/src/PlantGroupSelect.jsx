import React from 'react';

function PlantGroupSelect({ selectedValue, groups, showBlank, onChange }) {
    return <>
        <select name="groupFilter" value={selectedValue} onChange={(e) => onChange(e.target.value)}>
            {showBlank && <option key="Unselected" name=""></option>}
            <option key="None" name="">None ({groups.reduce(
                (accumulator, current) => accumulator + current.Count,
                0
            )})</option>
            {
                groups.map(group => 
                    <option key={group.Name} value={group.Name}>{group.Name}&nbsp;({group.Count})</option>
                )
            }
        </select>
    </>
    ;
}

export default PlantGroupSelect;