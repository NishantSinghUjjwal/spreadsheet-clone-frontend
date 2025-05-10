import React, { useEffect, useRef } from 'react'
import { HexColorPicker } from 'react-colorful'

const ColorPicker = ({changeCellBackground, onClose}: {changeCellBackground: (color: string) => void, onClose: () => void}) => {
    const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        console.log(popupRef.current,popupRef.current?.contains(event.target as Node))
        console.log(event.target)
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose(); // close popup
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  return (
    <div ref={popupRef} className="absolute z-10 mt-1 shadow-xl">
    <HexColorPicker color={'white'} onChange={changeCellBackground} />
</div>
  )
}

export default ColorPicker
