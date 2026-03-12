import svgPaths from "./svg-83y6mfkpbk";
import imgDesignSemNome1 from "figma:asset/64af5bea1f7d7b69df13506b3145a332f5049f18.png";

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

export default function PaginaPrincipal() {
  return (
    <div className="bg-[#ab4d4d] relative size-full" data-name="Página Principal">
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
      <div className="absolute left-[-49px] size-[500px] top-[115px]" data-name="Design sem nome 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgDesignSemNome1} />
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[#d9d9d9] h-[324px] left-1/2 rounded-[71px] top-[calc(50%+399px)] w-[402px]" />
      <div className="absolute bg-[#af0100] left-[158px] rounded-[100px] size-[78px] top-[732px]" data-name="mic">
        <div className="overflow-clip relative rounded-[inherit] size-full">
          <div className="absolute inset-[8.33%_20.83%_12.5%_20.83%]" data-name="icon">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 45.5 61.75">
              <path d={svgPaths.p9ec0c00} fill="var(--fill-0, white)" id="icon" />
            </svg>
          </div>
        </div>
        <div aria-hidden="true" className="absolute border-9 border-[#af0100] border-solid inset-[-9px] pointer-events-none rounded-[109px] shadow-[4px_4px_8px_0px_rgba(0,0,0,0.75)]" />
      </div>
      <div className="absolute bg-[#d9d9d9] h-[53px] left-[-25px] rounded-[22px] top-[62px] w-[89px]" />
      <div className="absolute left-[8px] overflow-clip size-[40px] top-[67px]" data-name="Menu">
        <div className="absolute bottom-1/4 left-[12.5%] right-[12.5%] top-1/4" data-name="Icon">
          <div className="absolute inset-[-8.75%_-5.83%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 33.5 23.5">
              <path d={svgPaths.p865c480} id="Icon" stroke="var(--stroke-0, #1E1E1E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" />
            </svg>
          </div>
        </div>
      </div>
      <p className="-translate-x-1/2 absolute font-['Luckiest_Guy:Regular',sans-serif] h-[64px] leading-[normal] left-1/2 not-italic text-[32px] text-center text-white top-[64px] w-[354px]">
        MEAPLE BEAR
        <br aria-hidden="true" />
        INGLÊS
      </p>
      <p className="-translate-x-1/2 absolute font-['Luckiest_Guy:Regular',sans-serif] h-[20px] leading-[normal] left-[201px] not-italic text-[#919191] text-[20px] text-center top-[836px] w-[248px]">APERTE PARA CONVERSAR</p>
    </div>
  );
}