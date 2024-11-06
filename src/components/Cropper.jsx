import { useState } from 'react';

import Button from './custom-components/Button';
import VideoPlayer from './VideoPlayer';
import PreviewBox from './PreviewBox';

const Cropper = () => {
   const [aspectRatio, setAspectRatio] = useState('9:16');
   const [isCropperActive, setIsCropperActive] = useState(false);
   const [preview, setPreview] = useState(null);
   const [jsonData, setJsonData] = useState([]);

   const handleAspectRatioChange = (event) => {
      setAspectRatio(event.target.value);
   };

   const handleStartCropper = () => {
      setIsCropperActive(true);
   };
   
   const handleRemoveCropper = () => {
      setIsCropperActive(false);
   };
   
   const downloadJson = () => {
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'videoData.json';
      link.click();
   };

   return (
      <div className="fixed inset-0 flex justify-center items-center">
         <div className="bg-[#37393F] text-[#fff] rounded-lg shadow-lg max-w-md md:max-w-4xl w-full grid gap-4">
            <div className='flex justify-between items-center p-4'>
               <h3 className='font-semibold capitalize text-lg'>Cropper</h3>
            </div>
            <div className='p-4 pt-0'>
               <div className='grid md:grid-cols-2 gap-4'>
                  <VideoPlayer
                     aspectRatio={aspectRatio}
                     handleAspectRatioChange={handleAspectRatioChange}
                     isCropperActive={isCropperActive}
                     setPreview={setPreview}
                     setJsonData={setJsonData}
                  />
                  <PreviewBox
                     isCropperActive={isCropperActive}
                     preview={preview}
                     aspectRatio={aspectRatio}
                  />
               </div>
            </div>
            <div className='flex justify-between border-t-[#494C55] border-t-[1px] p-4'>
               <div className='flex gap-2 items-center flex-wrap'>
                  <Button buttonText={"Start Cropper"} onClickHandle={handleStartCropper} isDisabled={isCropperActive} />
                  <Button buttonText={"Remove Cropper"} onClickHandle={handleRemoveCropper} isDisabled={!isCropperActive} />
                  <Button buttonText={"Generate Preview"} onClickHandle={downloadJson} isDisabled={!isCropperActive}/>
               </div>
               <div className='flex gap-2 items-center flex-wrap'>
                  <Button buttonText={"Cancel"} buttonType={"gray"} />
               </div>
            </div>
         </div>
      </div>
   );
}

export default Cropper;
