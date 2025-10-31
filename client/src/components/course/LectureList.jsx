import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, Lock, CheckCircle } from 'lucide-react';

const LectureList = ({ lectures, courseId, isInstructor = false }) => {
  const formatDuration = (seconds) => {
    if (!seconds) return '00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {lectures.map((lecture, index) => (
          <li key={lecture._id} className="hover:bg-gray-50">
            <Link
              to={`/courses/${courseId}/lectures/${lecture._id}`}
              className="block hover:bg-gray-50"
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-primary-100 text-primary-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary-600 truncate">
                        {lecture.title}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <span>{formatDuration(lecture.duration)}</span>
                        {lecture.isPreview && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Preview
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isInstructor && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {lecture.status || 'Draft'}
                      </span>
                    )}
                    <div className="text-gray-400">
                      <Play className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LectureList;
