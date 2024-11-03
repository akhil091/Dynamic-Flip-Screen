const Dropdown = ({ data, onChangeHandle, defaultValue }) => (
   <div className='relative'>
      <select onChange={onChangeHandle} value={defaultValue}
         className='p-2 border border-[#494C55] rounded-lg bg-transparent cursor-pointer' style={{ width: '200px'}}>
         {data.map(option => (
            <option key={option.value} value={option.value} className="text-white bg-[#37393F]">
               {option.text}
            </option>
         ))}
      </select>
   </div>
);

export default Dropdown;