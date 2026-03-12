import svgPaths from "./svg-znlkufed9n";

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
    <div className="absolute contents left-[301px] top-[783px]">
      <div className="absolute bg-[#e7cbcb] left-[301px] overflow-clip rounded-[50px] shadow-[4px_4px_8px_0px_rgba(0,0,0,0.6)] size-[71px] top-[783px]" data-name="check">
        <div className="absolute bottom-1/4 left-[16.04%] right-[16.04%] top-[24.9%]" data-name="icon">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48.2208 35.574">
            <path d={svgPaths.p17a75f00} fill="var(--fill-0, #1D1B20)" id="icon" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function AboutTheProject() {
  return (
    <div className="bg-[#ab4d4d] relative size-full" data-name="About the Project 6">
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
      <div className="absolute flex items-center justify-center left-[180px] size-[19px] top-[714px]">
        <div className="flex-none rotate-180">
          <div className="relative size-[19px]">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 19">
              <circle cx="9.5" cy="9.5" fill="var(--fill-0, white)" id="Ellipse 2" r="9.5" />
            </svg>
          </div>
        </div>
      </div>
      <div className="absolute flex items-center justify-center left-[142px] size-[19px] top-[714px]">
        <div className="flex-none rotate-180">
          <div className="relative size-[19px]">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 19">
              <circle cx="9.5" cy="9.5" fill="var(--fill-0, white)" id="Ellipse 2" r="9.5" />
            </svg>
          </div>
        </div>
      </div>
      <div className="absolute flex h-[19px] items-center justify-center left-[217px] top-[714px] w-[43px]">
        <div className="flex-none rotate-180">
          <div className="bg-[#6d3232] h-[19px] rounded-[8px] w-[43px]" />
        </div>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[#d9d9d9] h-[441px] left-1/2 rounded-[51px] top-[calc(50%-132.5px)] w-[354px]" />
      <p className="-translate-x-1/2 absolute font-['Luckiest_Guy:Regular',sans-serif] h-[137px] leading-[normal] left-[203px] not-italic overflow-hidden text-[28px] text-center text-ellipsis text-shadow-[4px_4px_4px_rgba(0,0,0,0.5)] text-white top-[558px] w-[354px]">Aqui não existe pergunta boba. Use sua voz para bater um papo, descobrir curiosidades incríveis e se tornar um mestre em qualquer assunto!</p>
      <Group />
    </div>
  );
}