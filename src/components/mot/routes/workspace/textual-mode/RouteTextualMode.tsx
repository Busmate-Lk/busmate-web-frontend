'use client';

export default function RouteTextualMode() {
  return (
    <>
      <div>RouteTextualMode</div>
      {/* Full available screen sized text editor area to type or paste full route group data with route data and routestop data in textual format */}
      <div>
        <textarea className="w-full h-[750px] border-2 border-gray-400 rounded px-2 py-1 outline-none" />
      </div>
    </>
  )
}
