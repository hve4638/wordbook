import React from "react";

interface GoogleFontIconProps {
    className?:string;
    value:string;
    style?:React.CSSProperties;
    onClick?:()=>void;
}

function GoogleFontIcon({
    className='',
    value,
    style={},
    onClick = ()=>{},
}:GoogleFontIconProps) {
    return (
        <label
            className={`${className} undraggable center`}
            style={style}
            onClick={(e)=>onClick()}
        >
            <span
                className={`material-symbols-outlined`}
            >
                {value}
            </span>
        </label>
    )
}

export default GoogleFontIcon;