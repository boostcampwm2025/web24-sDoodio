import { AlertCircle, Calendar, Edit3, ListTodo, Plus } from 'lucide-react';
import type { BehaviorHeaderProps } from '../types/behavior.types';

function BehaviorHeader({ info, onToggleAdd }: BehaviorHeaderProps) {
  return (
    <div className="relative mb-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold text-white ${info.category.color}`}
        >
          {info.category.label}
        </span>
        <button
          className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-indigo-600"
          type="button"
        >
          <Edit3 size={18} />
        </button>
      </div>

      <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">{info.title}</h1>

      <p className="mb-6 text-sm leading-relaxed text-gray-500 md:text-base">{info.description}</p>

      <div className="flex flex-col justify-between gap-4 border-t border-gray-50 pt-4 md:flex-row md:items-center">
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 font-medium">
            <Calendar size={16} className="text-gray-500" />
            <span>{info.period}</span>
          </div>
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-medium ${info.isMandatory ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}
          >
            <AlertCircle size={16} />
            <span>{info.isMandatory ? '필수' : '선택'}</span>
          </div>
        </div>

        <button
          onClick={onToggleAdd}
          type="button"
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold shadow-sm transition-all duration-200 active:scale-95 ${
            info.isAddedToToday
              ? 'border-indigo-600 bg-indigo-600 text-white'
              : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
          } `}
        >
          {info.isAddedToToday ? (
            <>
              <ListTodo size={18} />
              <span>오늘 목록에 있음</span>
            </>
          ) : (
            <>
              <Plus size={18} />
              <span>오늘 하기</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default BehaviorHeader;
