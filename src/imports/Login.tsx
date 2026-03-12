import svgPaths from "./svg-73kbd9mkfy";
import imgMapleBear1 from "figma:asset/6c3426f11b33df20ca0ee5541adeebb2cfe1674d.png";

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

function Logo() {
  return (
    <div className="absolute contents left-[81px] top-[109px]" data-name="Logo">
      <div className="absolute bg-white h-[63px] left-[163px] top-[214px] w-[75px]" />
      <div className="absolute left-[81px] size-[240px] top-[109px]" data-name="MAPLE BEAR 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgMapleBear1} />
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-white min-w-[120px] relative rounded-[8px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center min-w-[inherit] overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center min-w-[inherit] px-[16px] py-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-none min-h-px min-w-px not-italic relative text-[#b3b3b3] text-[16px]">Value</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#d9d9d9] border-solid inset-[-0.5px] pointer-events-none rounded-[8.5px]" />
    </div>
  );
}

function Input1() {
  return (
    <div className="bg-white min-w-[120px] relative rounded-[8px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center min-w-[inherit] overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center min-w-[inherit] px-[16px] py-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-none min-h-px min-w-px not-italic relative text-[#b3b3b3] text-[16px]">Value</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#d9d9d9] border-solid inset-[-0.5px] pointer-events-none rounded-[8.5px]" />
    </div>
  );
}

export default function Login() {
  return (
    <div className="bg-[#ab4d4d] relative size-full" data-name="Login">
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
      <Logo />
      <div className="absolute bg-white content-stretch flex flex-col gap-[24px] h-[322px] items-start left-[24px] min-w-[320px] p-[24px] rounded-[8px] top-[366px] w-[354px]" data-name="Form Log In">
        <div aria-hidden="true" className="absolute border border-[#d9d9d9] border-solid inset-0 pointer-events-none rounded-[8px]" />
        <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Input Field">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] min-w-full not-italic relative shrink-0 text-[#1e1e1e] text-[16px] w-[min-content]">Username</p>
          <Input />
        </div>
        <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Input Field">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] min-w-full not-italic relative shrink-0 text-[#1e1e1e] text-[16px] w-[min-content]">Password</p>
          <Input1 />
        </div>
        <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Button Group">
          <div className="bg-[#a80000] flex-[1_0_0] min-h-px min-w-px relative rounded-[8px]" data-name="Button">
            <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[8px] items-center justify-center p-[12px] relative w-full">
                <p className="font-['Inter:Regular',sans-serif] font-normal leading-none not-italic relative shrink-0 text-[#f5f5f5] text-[16px] whitespace-nowrap">Log In</p>
              </div>
            </div>
            <div aria-hidden="true" className="absolute border border-[#2c2c2c] border-solid inset-0 pointer-events-none rounded-[8px]" />
          </div>
        </div>
        <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Text Link">
          <p className="[text-decoration-skip-ink:none] decoration-solid font-['Inter:Regular',sans-serif] font-normal leading-[1.4] not-italic relative shrink-0 text-[#1e1e1e] text-[16px] underline whitespace-nowrap">Forgot password?</p>
        </div>
      </div>
    </div>
  );
}