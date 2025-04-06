import React from 'react';

function PlantGroupSelect({ selectedValue, groups, showBlank, onChange }) {    
    return <>
        <select name="groupFilter" value={selectedValue} onChange={(e) => onChange(e.target.value)}>
            {showBlank && <option key="Unselected" name=""></option>}
            <option key="None" value="">None ({groups[0].AttributeValues.reduce(
                (accumulator, current) => accumulator + current.Count,
                0
            )})</option>
            
            {
                groups.map(group => 
                    <optgroup key={group.AttributeDisplayName} label={group.AttributeDisplayName}>
                    
                    {
                        group.AttributeValues.map(v => 
                            <option key={v.FilterExpression} value={v.FilterExpression}>{v.DisplayName}&nbsp;({v.Count})</option>
                        )
                    }
                    </optgroup>
                )
            }        
        </select>
    </>
    ;
}

export default PlantGroupSelect;