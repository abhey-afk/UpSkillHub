import React from 'react';
import ReactPlayer from 'react-player/lazy';

const VideoPlayer = ({ 
  url, 
  controls = true, 
  light = false, 
  width = '100%', 
  height = '100%',
  onDuration,
  onProgress
}) => {
  return (
    <div className="relative pt-[56.25%]"> {/* 16:9 Aspect Ratio */}
      <div className="absolute top-0 left-0 w-full h-full">
        <ReactPlayer
          url={url}
          width={width}
          height={height}
          controls={controls}
          light={light}
          onDuration={onDuration}
          onProgress={onProgress}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload',
                disablePictureInPicture: true,
              },
            },
          }}
          style={{
            backgroundColor: '#000',
          }}
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
