import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';

import Dropdown from './custom-components/Dropdown';
import Video from "../assets/video.mp4";

const VideoPlayer = ({ aspectRatio, handleAspectRatioChange, isCropperActive, setPreview, setJsonData }) => {
   const [videoState, setVideoState] = useState({
      isPlaying: false,
      volume: 1,
      playbackSpeed: 1,
      progress: 0,
      duration: 0,
      currentTime: 0,
      cropBox: { width: 0, height: 0, top: 0, left: 0 }
   });
   const videoRef = useRef(null);

   const playBackSpeedData = [
      { text: "0.25x", value: 0.25 },
      { text: "0.5x", value: 0.5 },
      { text: "1x", value: 1 },
      { text: "1.5x", value: 1.5 },
      { text: "2x", value: 2 },
      { text: "3x", value: 3 }
   ];
   const aspectRatioData = [
      { text: "9:18", value: "9:18" },
      { text: "9:16", value: "9:16" },
      { text: "4:3", value: "4:3" },
      { text: "3:4", value: "3:4" },
      { text: "1:1", value: "1:1" },
      { text: "4:5", value: "4:5" },
   ];
   
   const formatTime = (time) => {
      const date = new Date(null);
      date.setSeconds(time);
      return date.toISOString().substring(11, 19);
   };

   const handlePlayPause = () => {
      videoRef.current[videoState.isPlaying ? 'pause' : 'play']();
      setVideoState(prevState => ({...prevState, isPlaying: !prevState.isPlaying}));
   };

   const handleMediaChange = (e, type) => {
      const newValue = e.target.value;
      setVideoState(prevState => ({
         ...prevState,
         [type]: newValue
      }));
   };

   const handleProgressAndTimeUpdate = () => {
      const video = videoRef.current;
      setVideoState(prevState => ({
         ...prevState,
         currentTime: video.currentTime,
         progress: (video.currentTime / video.duration) * 100
      }));
   };

   const handleTimelineChange = (e) => {
      const video = videoRef.current;
      const newTime = (e.target.value / 100) * video.duration;
      video.currentTime = newTime;
      setVideoState(prevState => ({
         ...prevState,
         progress: e.target.value
      }));
   };

   useEffect(() => {
      const video = videoRef.current;

      const handleLoadedMetadata = () => {
         setVideoState(prevState => ({
            ...prevState,
            duration: video.duration
         }));
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('timeupdate', handleProgressAndTimeUpdate);

      return () => {
         video.removeEventListener('loadedmetadata', handleLoadedMetadata);
         video.removeEventListener('timeupdate', handleProgressAndTimeUpdate);
      };
   }, []);

   const calculateCropBox = () => {
      if (!videoRef.current) return;
      
      const videoWidth = videoRef.current.offsetWidth;
      const videoHeight = videoRef.current.offsetHeight;
      const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
      const cropWidth = videoWidth;
      const cropHeight = Math.min((cropWidth / widthRatio) * heightRatio, videoHeight);
      const cropWidthAdjusted = cropHeight * widthRatio / heightRatio;

      setVideoState(prevState => ({
         ...prevState,
         cropBox: {
            width: cropWidthAdjusted,
            height: cropHeight,
            top: videoHeight - cropHeight,
            left: 0,
         }
      }));
   };
   useEffect(() => {
      calculateCropBox();
   }, [aspectRatio]);

   useEffect(() => {
      if (!isCropperActive) return;

      const generateLivePreview = () => {
         const video = videoRef.current;
         if (!video || video.readyState < 2) return;

         const { width, height, left, top } = videoState.cropBox;
         if (width <= 0 || height <= 0) {
            console.error('Invalid cropBox dimensions:', videoState.cropBox);
            return;
         }

         const canvas = document.createElement('canvas');
         const context = canvas.getContext('2d');
         canvas.width = width;
         canvas.height = height;

         context.drawImage(
            video,
            left * 1.5, top * 1.5, width * 1.5, height * 1.5,
            0, 0, width, height
         );
         setPreview(canvas.toDataURL());
      };

      const interval = setInterval(generateLivePreview, 10);
      return () => clearInterval(interval);
   }, [aspectRatio, videoState.cropBox, isCropperActive, setPreview]);
 
   const updateCropBox = (newDimensions) => {
      setVideoState(prevState => ({
         ...prevState,
         cropBox: {
            ...prevState.cropBox,
            ...newDimensions,
         }
      }));
   };

   const handleDrag = (e, data) => {
      updateCropBox({
         left: Math.max(0, Math.min(data.x, videoRef.current.offsetWidth - videoState.cropBox.width)),
         top: Math.max(0, Math.min(data.y, videoRef.current.offsetHeight - videoState.cropBox.height))
      });
   };

   useEffect(() => {
      if (!videoState.isPlaying) return;

      const interval = setInterval(() => {
         setJsonData((prevData) => [
            ...prevData,
            {
               timeStamp: videoRef.current.currentTime,
               coordinates: [videoState.cropBox.left, videoState.cropBox.top, videoState.cropBox.width, videoState.cropBox.height],
               volume: videoState.volume,
               playbackSpeed: videoState.playbackSpeed,
            },
         ]);
      }, 1000);

      return () => clearInterval(interval);
   }, [videoState.isPlaying, videoState.cropBox, videoState.volume, videoState.playbackSpeed]);

   return (
      <div className="grid gap-2">
         <div className='relative aspect-video w-full'>
            <video
               ref={videoRef}
               onTimeUpdate={handleProgressAndTimeUpdate}
               className="w-full h-full aspect-video"
               width="100%"
               src={Video}
            />
            {isCropperActive && (
               <Draggable bounds="parent" onDrag={handleDrag}>
                  <div
                     className="crop-overlay cursor-move border-white absolute border-x top-0 left-0"
                     style={{
                        aspectRatio: `${aspectRatio.replace(":", " / ")}`,
                        width: videoState.cropBox.width,
                        height: videoState.cropBox.height,
                     }}
                  >
                     <div className='absolute w-full h-[1px] border-b border-dashed border-white top-[33%]'></div>
                     <div className='absolute w-full h-[1px] border-t border-dashed border-white bottom-[33%]'></div>
                     <div className='absolute w-[1px] h-full border-r border-dashed border-white left-[33%]'></div>
                     <div className='absolute w-[1px] h-full border-l border-dashed border-white right-[33%]'></div>
                  </div>
               </Draggable>
            )}
         </div>
         <div className="controls flex flex-col">
            <div className='flex items-center gap-2'>
               <button onClick={handlePlayPause} className="text-2xl">
                  {videoState.isPlaying ? <i className='bi bi-pause-fill'></i> : <i className='bi bi-play-fill'></i>}
               </button>
               <input
                  type="range"
                  value={videoState.progress}
                  onChange={handleTimelineChange}
                  className="timeline w-full appearance-none h-1 bg-black bg-opacity-7 rounded-full"
                  min="0"
                  max="100"
                  style={{
                     background: `linear-gradient(to right, white ${videoState.progress}%, rgba(255, 255, 255, 0.07) ${videoState.progress}%)`,
                  }}
               />
            </div>
            <div className='flex justify-between items-center'>
               <div className="flex justify-center items-center gap-1 text-sm">
                  <span>{formatTime(videoState.currentTime)}</span>
                  <span className='opacity-50'>|</span>
                  <span className='opacity-50'>{formatTime(videoState.duration)}</span>
               </div>
               <div className="text-xl flex items-center gap-2">
                  <i className={`bi ${videoState.volume * 100 >= 60 ? 'bi-volume-up-fill' : videoState.volume * 100 > 0 ? 'bi-volume-down-fill' : 'bi-volume-mute-fill'}`}></i>
                  <input
                     type="range"
                     value={videoState.volume}
                     onChange={(e) => handleMediaChange(e, 'volume')}
                     min="0"
                     max="1"
                     step="0.01"
                     className="timeline w-[60px] appearance-none h-[3px] bg-black bg-opacity-7 rounded-full"
                     style={{
                        background: `linear-gradient(to right, white ${videoState.volume * 100}%, rgba(255, 255, 255, 0.07) ${videoState.volume * 100}%)`,
                     }}
                  />
               </div>
            </div>
            <div className='flex justify-start items-center gap-2 mt-2'>
               <Dropdown data={playBackSpeedData} defaultValue={videoState.playbackSpeed} onChangeHandle={(e) => handleMediaChange(e, 'playbackSpeed')} />
               <Dropdown data={aspectRatioData} defaultValue={aspectRatio} onChangeHandle={handleAspectRatioChange} />
            </div>
         </div>
      </div>
   )
}

export default VideoPlayer;