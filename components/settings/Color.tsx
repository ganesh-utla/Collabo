import { Attributes } from "@/types/type";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type Props = {
  inputRef: any;
  attribute: string;
  placeholder: string;
  attributeType: string;
  handleInputChange: (property: string, value: string) => void;
  isEditingRef: React.MutableRefObject<boolean>;
  elementAttributes: Attributes;
};

const Color = ({
  inputRef,
  attribute,
  placeholder,
  attributeType,
  handleInputChange,
  isEditingRef,
  elementAttributes
}: Props) => (
  <div className='flex flex-col gap-3 border-b border-primary-grey-200 p-5'>
    <h3 className='text-[10px] uppercase'>{placeholder}</h3>
    {placeholder==='stroke' && (
      <Input
        type='number'
        placeholder='100'
        value={elementAttributes.strokeWidth}
        className='input-ring'
        min={0}
        max={100}
        onChange={(e) => handleInputChange('strokeWidth', e.target.value)}
        onBlur={(e) => {
          isEditingRef.current = false
        }}
      />
    )}
    <div
      className='flex items-center gap-2 border border-primary-grey-200'
      onClick={() => inputRef.current.click()}
    >
      <input
        type='color'
        value={attribute}
        ref={inputRef}
        onChange={(e) => handleInputChange(attributeType, e.target.value)}
      />
      <Label className='flex-1'>{attribute}</Label>
    </div>
  </div>
);

export default Color;
