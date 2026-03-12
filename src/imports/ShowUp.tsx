import svgPaths from "./svg-yg0e8i6oef";
import imgMapleBear1 from "figma:asset/6c3426f11b33df20ca0ee5541adeebb2cfe1674d.png";

function Logo() {
  return (
    <div className="absolute contents left-[81px] top-[318px]" data-name="Logo">
      <div className="absolute bg-white h-[63px] left-[163px] top-[423px] w-[75px]" />
      <div className="absolute left-[81px] size-[240px] top-[318px]" data-name="MAPLE BEAR 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgMapleBear1} />
      </div>
    </div>
  );
}

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

export default function ShowUp() {
  return (
    <div className="relative size-full" data-name="ShowUp">
      <div className="absolute left-[92px] size-[217px] top-[346px]">
        <div className="absolute inset-[-46.08%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 417 417">
            <g filter="url(#filter0_f_2_698)" id="Ellipse 4">
              <circle cx="208.5" cy="208.5" fill="var(--fill-0, #8A8A8A)" r="108.5" />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="417" id="filter0_f_2_698" width="417" x="0" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                <feGaussianBlur result="effect1_foregroundBlur_2_698" stdDeviation="50" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
      <Logo />
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
    </div>
  );
}