import React from "react";

interface GoogleFontIconProps {
    className?:string;
    value:string;
    selected?:boolean;
    style?:React.CSSProperties;
    onClick?:()=>void;
}

/**
 * https://fonts.google.com/icons 에서 가져온 아이콘 표시
 * @param value Icon name
 * @param selected true면 selected 클래스 추가
 * @returns 
 */
function GoogleFontIconButton({
    className='', value, selected=false, onClick = ()=>{},
    style = {}
}:GoogleFontIconProps) {
    return (
        <label
            className={`font-button-container undraggable center ${className}`}
            onClick={(e)=>onClick()}
            style={style}
        >
            <span className={`material-symbols-outlined font-button${selected ? ' selected' : ''}`}>
                {value}
            </span>
        </label>
    )
}

export default GoogleFontIconButton;