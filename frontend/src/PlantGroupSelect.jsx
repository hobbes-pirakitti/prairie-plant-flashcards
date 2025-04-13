import React from 'react';

// assumes that there are grouped and ungrouped filters
function PlantGroupSelect({ totalNonShortlistPlants: totalNonShortlistPlants, selectedValue, groups, showBlank, onChange }) {    
    const groupedFilters = groups.filter(g => 'AttributeValues' in g);
    const unGroupedFilters = groups.filter(g => !('AttributeValues' in g));
    
    return <>
        <select name="groupFilter" value={selectedValue} onChange={(e) => onChange(e.target.value)}>
            {showBlank && <option key="Unselected" name=""></option>}

            <option key="None" value="">None ({totalNonShortlistPlants})</option>            

            {
                groupedFilters.length > 0 && groupedFilters.map(group => 
                    <optgroup key={group.AttributeDisplayName} label={group.AttributeDisplayName}>
                    
                    {
                        group.AttributeValues.map(v => 
                            <option key={v.FilterExpression} value={v.FilterExpression}>{v.DisplayName}&nbsp;({v.Count})</option>
                        )
                    }
                    </optgroup>
                )
            }    
            
            {
                unGroupedFilters.length > 0 && unGroupedFilters.map(v =>                     
                    <option key={v.FilterExpression} value={v.FilterExpression}>{v.DisplayName}&nbsp;({v.Count})</option>
                )
            }     
        </select>
    </>
    ;
}

export default PlantGroupSelect;