import CursorSVG from '@/public/assets/CursorSVG';
import React from 'react'

type Props = {
  x: number;
  y: number;
  color: string;
  message: string;
}

const Cursor = ({ x, y, color, message } : Props) => {
  return (
    <div 
      className='pointer-events-none absolute top-0 left-0' 
      style={{ transform: `translateX(${x}px) translateY(${y}px)`}}
    >
     <CursorSVG 
        color={color}
     /> 
     {message && (
      <div 
        className='absolute top-5 left-2 text-white px-4 py-2 leading-relaxed text-sm rounded-full' 
        style={{ backgroundColor: color }}
      >
        <div>{message}</div>
      </div>
     )}
    </div>
  )
}

export default Cursor