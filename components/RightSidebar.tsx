import React, { useRef } from 'react'
import Dimensions from './settings/Dimensions'
import Color from './settings/Color'
import Export from './settings/Export'
import Text from './settings/Text'
import { RightSidebarProps } from '@/types/type'
import { modifyShape } from '@/lib/shapes'
import { Input } from './ui/input'
import { Label } from './ui/label'

const RightSidebar = ({ 
  elementAttributes, 
  setElementAttributes,
  isEditingRef,
  fabricRef,
  activeObjectRef,
  syncShapeInStorage,
  canvasAttributes,
  setCanvasAttributes
} : RightSidebarProps) => {

  const colorInputRef = useRef(null);
  const strokeInputRef = useRef(null);
  const canvasBgInputRef: any = useRef(null);

  const handleInputChange = (property: string, value: string) => {
    if (!isEditingRef.current) isEditingRef.current = true;

    setElementAttributes((prev) => ({ ...prev, [property]: value }));

    modifyShape({
      canvas: fabricRef.current as fabric.Canvas,
      property,
      value,
      activeObjectRef,
      syncShapeInStorage
    })
  }

  return (
    <section className='min-w-[230px] h-screen flex flex-col border-t border-primary-grey-200 bg-primary-black text-primary-grey-300 max-sm:hidden overflow-y-auto select-none pb-20'>
      <h3 className='px-5 pt-4 text-xs uppercase'>
        Design
      </h3>
      <span className='mt-3 pb-5 px-5 border-b border-primary-grey-200 text-xs'>
        Make changes as you like
      </span>

      <div className='flex flex-col gap-3 border-b border-primary-grey-200 p-5'>
        <h3 className='text-[10px] uppercase'>canvas</h3>
        <div
          className='flex items-center gap-2 border border-primary-grey-200'
          onClick={() => canvasBgInputRef.current?.click()}
        >
          <input
            type='color'
            value={canvasAttributes.backgroundColor}
            ref={canvasBgInputRef}
            onChange={(e) => setCanvasAttributes(prev => ({...prev, backgroundColor: e.target.value}))}
          />
          <Label className='flex-1'>{canvasAttributes.backgroundColor}</Label>
        </div>
      </div>

      <Dimensions 
        width={elementAttributes.width}
        height={elementAttributes.height}
        isEditingRef={isEditingRef}
        handleInputChange={handleInputChange}
      />
      <Text 
        fontFamily={elementAttributes.fontFamily}
        fontWeight={elementAttributes.fontWeight}
        fontSize={elementAttributes.fontSize}
        handleInputChange={handleInputChange}
      />
      <Color 
        inputRef={colorInputRef}
        attribute={elementAttributes.fill}
        attributeType='fill'
        placeholder='color'
        handleInputChange={handleInputChange}
        isEditingRef={isEditingRef}
        elementAttributes={elementAttributes}
      />
      <Color 
        inputRef={strokeInputRef}
        attribute={elementAttributes.stroke}
        attributeType='stroke'
        placeholder='stroke'
        handleInputChange={handleInputChange}
        isEditingRef={isEditingRef}
        elementAttributes={elementAttributes}
      />
      <div className='flex flex-col gap-3 border-b border-primary-grey-200 p-5'>
        <h3 className='text-[10px] uppercase'>Opacity</h3>
        <Input
          type='number'
          placeholder='1'
          value={elementAttributes.opacity}
          className='input-ring'
          min={0}
          max={1}
          onChange={(e) => handleInputChange('opacity', e.target.value)}
          onBlur={(e) => {
            isEditingRef.current = false
          }}
        />
      </div>
      <Export canvasAttributes={canvasAttributes} />
    </section>
  )
}

export default RightSidebar