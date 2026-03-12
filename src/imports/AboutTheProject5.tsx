import svgPaths from "./svg-e0p02g5mga";

function Wifi() {
  return (
    <div className="col-1 ml-0 mt-0 relative row-1 size-[17px]" data-name="Wifi">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
        <g id="Wifi">
          <g id="Path" />
          <g id="Rectangle" />
          <g id="Path_2" />
          <path d={svgPaths.p34567080} fill="var(--fill-0, #1D1B20)" id="Path_3" opacity="0.1" />
        </g>
      </svg>
    </div>
  );
}

function Signal() {
  return (
    <div className="col-1 ml-[34.78%] mt-0 relative row-1 size-[17px]" data-name="Signal">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
        <g id="Signal">
          <g id="Path" />
          <path d={svgPaths.p112c6500} fill="var(--fill-0, #1D1B20)" id="Path_2" />
        </g>
      </svg>
    </div>
  );
}

function Battery() {
  return (
    <div className="col-1 h-[15px] ml-[38px] mt-px relative row-1 w-[8px]" data-name="Battery">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 15">
        <g id="Battery">
          <path d={svgPaths.p2dfd100} fill="var(--fill-0, #1D1B20)" id="Base" opacity="0.3" />
          <path d={svgPaths.p2657cc00} fill="var(--fill-0, #1D1B20)" id="Charge" />
        </g>
      </svg>
    </div>
  );
}

function RightIcons() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="right icons">
      <Wifi />
      <Signal />
      <Battery />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute h-[57px] left-[286px] top-[789px] w-[92px]">
      <div className="absolute inset-[-7.02%_-13.04%_-21.05%_-4.35%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 108 73">
          <g id="Group 1">
            <g filter="url(#filter0_d_2_764)" id="Rectangle 3">
              <rect fill="var(--fill-0, white)" fillOpacity="0.71" height="57" rx="19" shapeRendering="crispEdges" width="92" x="4" y="4" />
            </g>
            <path d={svgPaths.p20495ff0} fill="var(--stroke-0, black)" id="Arrow 1" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="73" id="filter0_d_2_764" width="108" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dx="4" dy="4" />
              <feGaussianBlur stdDeviation="4" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.56 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_2_764" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_2_764" mode="normal" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

export default function AboutTheProject() {
  return (
    <div className="bg-[#ab4d4d] relative size-full" data-name="About the Project 5">
      <div className="absolute content-stretch flex h-[52px] items-end justify-between left-0 px-[24px] py-[10px] top-0 w-[402px]" data-name="Building Blocks/status-bar">
        <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#1d1b20] text-[14px] tracking-[0.14px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100", fontFeatureSettings: "'ss02', 'dlig', 'lnum', 'pnum'" }}>
          <p className="leading-[20px]">9:30</p>
        </div>
        <RightIcons />
        <div className="-translate-x-1/2 absolute left-1/2 size-[24px] top-[18px]" data-name="Camera Cutout">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
            <path clipRule="evenodd" d={svgPaths.p34df7200} fill="var(--fill-0, #1D1B20)" fillRule="evenodd" id="Camera Cutout" />
          </svg>
        </div>
      </div>
      <Group />
      <div className="absolute left-[154px] size-[19px] top-[714px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 19">
          <circle cx="9.5" cy="9.5" fill="var(--fill-0, white)" id="Ellipse 2" r="9.5" />
        </svg>
      </div>
      <div className="absolute left-[241px] size-[19px] top-[714px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 19">
          <circle cx="9.5" cy="9.5" fill="var(--fill-0, white)" id="Ellipse 2" r="9.5" />
        </svg>
      </div>
      <div className="absolute bg-[#6d3232] h-[19px] left-[185px] rounded-[8px] top-[714px] w-[43px]" />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[#d9d9d9] h-[441px] left-1/2 rounded-[51px] top-[calc(50%-132.5px)] w-[354px]" />
      <p className="-translate-x-1/2 absolute font-['Luckiest_Guy:Regular',sans-serif] h-[123px] leading-[30px] left-[203px] lowercase not-italic overflow-hidden text-[28px] text-center text-ellipsis text-shadow-[4px_4px_4px_rgba(0,0,0,0.5)] text-white top-[557px] w-[354px]">Quer entender a matemática com Fibonacci ou explorar a natureza com Humboldt? Nossos tutores estão prontos para conversar e ensinar tudo o que sabem.</p>
    </div>
  );
}