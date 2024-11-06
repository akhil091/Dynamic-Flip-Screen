const PreviewBox = ({ isCropperActive, preview, aspectRatio }) => (
   <div className='text-center'>
      <h3 className="text-white text-opacity-50">Preview</h3>
      <div className='aspect-video flex justify-center items-center mt-2'>
         {!isCropperActive && (
            <div className='flex flex-col justify-center items-center gap-1 md:px-20 text-center'>
               <i className='bi bi-youtube text-3xl leading-[100%]'></i>
               <h6 className='font-semibold text-[16px]'>Preview not available</h6>
               <p className='text-sm opacity-50'>Please click on “Start Cropper” and then play video</p>
            </div>
         )}
         {isCropperActive && (
            <div className={`aspect-[${aspectRatio.replace(":","/")}] w-full max-w-full max-h-[238px] flex justify-center`}>
               {preview && <img src={preview} className='h-full w-auto bg-[#ffffff11]' alt="Cropped preview" />}
            </div>
         )}
      </div>
   </div>
);

export default PreviewBox; 
