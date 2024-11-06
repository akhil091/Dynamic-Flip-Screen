import { useState, useRef, useEffect, useCallback } from 'react';
import Draggable from 'react-draggable';

import Dropdown from './custom-components/Dropdown';
import Video from "../video.mp4";

const VideoPlayer = ({ aspectRatio, handleAspectRatioChange, isCropperActive, setPreview, jsonData, setJsonData }) => {
   const videoRef = useRef(null);
   const [isPlaying, setIsPlaying] = useState(false);
   const [volume, setVolume] = useState(1);
   const [playbackSpeed, setPlaybackSpeed] = useState(1);
   const [progress, setProgress] = useState(0);
   const [duration, setDuration] = useState(0);
   const [currentTime, setCurrentTime] = useState(0);
   const [cropBox, setCropBox] = useState({ width: 0, height: 0, top: 0, left: 0 });
   
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
      videoRef.current[isPlaying ? 'pause' : 'play']();
      setIsPlaying(prevState => !prevState);
   };

   const handleVolumeChange = (e) => {
      const newVolume = e.target.value;
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
   };

   const handlePlaybackSpeedChange = (e) => {
      const newSpeed = e.target.value;
      videoRef.current.playbackRate = newSpeed;
      setPlaybackSpeed(newSpeed);
   };

   const handleProgress = () => {
      const video = videoRef.current;
      const currentProgress = (video.currentTime / video.duration) * 100;
      setProgress(currentProgress);
   };

   const handleTimelineChange = (e) => {
      const video = videoRef.current;
      const newTime = (e.target.value / 100) * video.duration;
      video.currentTime = newTime;
      setProgress(e.target.value);
   };

   const handleDrag = (e, data) => {
      setCropBox((prevBox) => ({
         ...prevBox,
         left: Math.max(0, Math.min(data.x, videoRef.current.offsetWidth - prevBox.width)),
         top: Math.max(0, Math.min(data.y, videoRef.current.offsetHeight - prevBox.height))
      }));
   };

   const setupVideoListeners = (video) => {
      const handleLoadedMetadata = () => setDuration(video.duration);
      const handleTimeUpdate = () => setCurrentTime(video.currentTime);

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('timeupdate', handleTimeUpdate);

      return () => {
         video.removeEventListener('loadedmetadata', handleLoadedMetadata);
         video.removeEventListener('timeupdate', handleTimeUpdate);
      };
   };

   const calculateCropBox = useCallback(() => {
      if (!videoRef.current) return;

      const videoWidth = videoRef.current.offsetWidth;
      const videoHeight = videoRef.current.offsetHeight;
      const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);

      const cropWidth = videoWidth;
      const cropHeight = Math.min((cropWidth / widthRatio) * heightRatio, videoHeight);
      const cropWidthAdjusted = cropHeight * widthRatio / heightRatio;

      setCropBox({
         width: cropWidthAdjusted,
         height: cropHeight,
         top: videoHeight - cropHeight,
         left: 0,
      });
   }, [aspectRatio]);

   useEffect(() => {
      const video = videoRef.current;
      const cleanupListeners = setupVideoListeners(video);
      return cleanupListeners;
   }, []);

   useEffect(() => {
      calculateCropBox();
   }, [aspectRatio, calculateCropBox]);

   useEffect(() => {
      if (!isCropperActive) return;

      const generateLivePreview = () => {
         if (!videoRef.current || videoRef.current.readyState < 2) return;

         const video = videoRef.current;
         const canvas = document.createElement('canvas');
         const context = canvas.getContext('2d');
         canvas.width = cropBox.width;
         canvas.height = cropBox.height;

         if (cropBox.width <= 0 || cropBox.height <= 0) {
            console.error('Invalid cropBox dimensions:', cropBox);
            return;
         }
         context.drawImage(
            video,
            cropBox.left * 1.5, cropBox.top * 1.5, (cropBox.width * 1.5), (cropBox.height * 1.5),
            0, 0, canvas.width, canvas.height
         );
         setPreview(canvas.toDataURL());
      };

      const interval = setInterval(generateLivePreview, 10);
      return () => clearInterval(interval);
   }, [aspectRatio, cropBox, isCropperActive, setPreview]);

   

   useEffect(() => {
      if (isPlaying) {
         const interval = setInterval(() => {
            setJsonData(prevData => [
               ...prevData,
               {
                  timeStamp: videoRef.current.currentTime,
                  coordinates: [cropBox.left, cropBox.top, cropBox.width, cropBox.height],
                  volume,
                  playbackSpeed,
               },
            ]);
         }, 1000);
         return () => clearInterval(interval);
      }
   }, [isPlaying, cropBox, volume, playbackSpeed, setJsonData ]);

   return (
      <div className="grid gap-2">
         <div className='relative aspect-video w-full'>
            <video
               ref={videoRef}
               onTimeUpdate={handleProgress}
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
                        width: cropBox.width,
                        height: cropBox.height,
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
                  {isPlaying ? <i className='bi bi-pause-fill'></i> : <i className='bi bi-play-fill'></i>}
               </button>
               <input
                  type="range"
                  value={progress}
                  onChange={handleTimelineChange}
                  className="timeline w-full appearance-none h-1 bg-black bg-opacity-7 rounded-full"
                  min="0"
                  max="100"
                  style={{
                     background: `linear-gradient(to right, white ${progress}%, rgba(255, 255, 255, 0.07) ${progress}%)`,
                  }}
               />
            </div>
            <div className='flex justify-between items-center'>
               <div className="flex justify-center items-center gap-1 text-sm">
                  <span>{formatTime(currentTime)}</span>
                  <span className='opacity-50'>|</span>
                  <span className='opacity-50'>{formatTime(duration)}</span>
               </div>
               <div className="text-xl flex items-center gap-2">
                  <i className={`bi ${volume * 100 >= 60 ? 'bi-volume-up-fill' : volume * 100 > 0 ? 'bi-volume-down-fill' : 'bi-volume-mute-fill'}`}></i>
                  <input
                     type="range"
                     value={volume}
                     onChange={handleVolumeChange}
                     min="0"
                     max="1"
                     step="0.01"
                     className="timeline w-[60px] appearance-none h-[3px] bg-black bg-opacity-7 rounded-full"
                     style={{
                        background: `linear-gradient(to right, white ${volume * 100}%, rgba(255, 255, 255, 0.07) ${volume * 100}%)`,
                     }}
                  />
               </div>
            </div>
            <div className='flex justify-start items-center gap-2 mt-2'>
               <Dropdown data={playBackSpeedData} defaultValue={playbackSpeed} optionLabel={"Playback Speed"} onChangeHandle={handlePlaybackSpeedChange} />
               <Dropdown data={aspectRatioData} defaultValue={aspectRatio} optionLabel={"Cropper Aspect Ratio"} onChangeHandle={handleAspectRatioChange} />
            </div>
         </div>
      </div>
   )
}

export default VideoPlayer;
