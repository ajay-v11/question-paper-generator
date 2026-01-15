import { useNavigate } from 'react-router-dom';
import { BookOpen, FileText, ArrowRight } from 'lucide-react';

const SubjectCard = ({ subject, onAction }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-300">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-md bg-indigo-500 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{subject.code}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{subject.name}</div>
              </dd>
            </dl>
          </div>
        </div>
        <div className="mt-4">
            <p className="text-sm text-gray-500 line-clamp-2">{subject.description || 'No description available.'}</p>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
          <button
            onClick={() => onAction ? onAction(subject) : navigate(`/subjects/${subject.id}`)}
            className="font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
          >
            Create Paper <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubjectCard;
