import svgPaths from "./svg-px23dkfonh";
import imgBuildingBlocksMultiRatioItems43 from "figma:asset/64af5bea1f7d7b69df13506b3145a332f5049f18.png";
import imgBuildingBlocksMultiRatioItems44 from "figma:asset/060c3252628a858a4cfcc538886d6f1d1c5950f1.png";
import imgBuildingBlocksMultiRatioItems45 from "figma:asset/d0f70ddc6a30f0e98f4af7fa8f7ca896e028f8ff.png";
import imgBuildingBlocksMultiRatioItems46 from "figma:asset/054dfe02e425078fdd66113858fbed2e929f9c10.png";

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

function Content() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] inset-0 items-start justify-end p-[16px]" data-name="Content">
      <div aria-hidden="true" className="absolute bg-gradient-to-b from-[rgba(255,255,255,0)] inset-0 mix-blend-multiply pointer-events-none to-[rgba(0,0,0,0.5)]" />
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-end leading-[0] relative shrink-0 text-[45px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[52px]">Inglês</p>
      </div>
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-end leading-[0] relative shrink-0 text-[14px] text-white tracking-[0.25px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px]">Maple Bear</p>
      </div>
    </div>
  );
}

function CarouselText() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Carousel text">
      <Content />
    </div>
  );
}

function Content1() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] inset-0 items-start justify-end p-[16px]" data-name="Content">
      <div aria-hidden="true" className="absolute bg-gradient-to-b from-[rgba(255,255,255,0)] inset-0 mix-blend-multiply pointer-events-none to-[rgba(0,0,0,0.5)]" />
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-end leading-[0] relative shrink-0 text-[45px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[52px]">Matemática</p>
      </div>
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-end leading-[0] relative shrink-0 text-[14px] text-white tracking-[0.25px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px]">Leonardo Fibonacci</p>
      </div>
    </div>
  );
}

function CarouselText1() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Carousel text">
      <Content1 />
    </div>
  );
}

function Content2() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] inset-0 items-start justify-end p-[16px]" data-name="Content">
      <div aria-hidden="true" className="absolute bg-gradient-to-b from-[rgba(255,255,255,0)] inset-0 mix-blend-multiply pointer-events-none to-[rgba(0,0,0,0.5)]" />
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-end leading-[0] relative shrink-0 text-[45px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[52px]">Geografia</p>
      </div>
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-end leading-[0] relative shrink-0 text-[14px] text-white tracking-[0.25px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px]">Alexander von Humboldt</p>
      </div>
    </div>
  );
}

function CarouselText2() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Carousel text">
      <Content2 />
    </div>
  );
}

function Content3() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] inset-0 items-start justify-end p-[16px]" data-name="Content">
      <div aria-hidden="true" className="absolute bg-gradient-to-b from-[rgba(255,255,255,0)] inset-0 mix-blend-multiply pointer-events-none to-[rgba(0,0,0,0.5)]" />
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-end leading-[0] relative shrink-0 text-[45px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[52px]">Física</p>
      </div>
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-end leading-[0] relative shrink-0 text-[14px] text-white tracking-[0.25px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px]">Einstein</p>
      </div>
    </div>
  );
}

function CarouselText3() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Carousel text">
      <Content3 />
    </div>
  );
}

function Content4() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] inset-0 items-start justify-end p-[16px]" data-name="Content">
      <div aria-hidden="true" className="absolute bg-gradient-to-b from-[rgba(255,255,255,0)] inset-0 mix-blend-multiply pointer-events-none to-[rgba(0,0,0,0.5)]" />
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-end leading-[0] relative shrink-0 text-[45px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[52px]">História</p>
      </div>
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-end leading-[0] relative shrink-0 text-[14px] text-white tracking-[0.25px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px]">Supporting Text</p>
      </div>
    </div>
  );
}

function CarouselText4() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Carousel text">
      <Content4 />
    </div>
  );
}

export default function SelecioneOMentor() {
  return (
    <div className="bg-[#ab4d4d] relative size-full" data-name="Selecione o Mentor">
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
      <div className="absolute content-stretch flex flex-col h-[264px] items-start left-[25px] overflow-clip rounded-[28px] top-[265px] w-[351px]" data-name="Building blocks/Multi-ratio items/4:3">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[28px]">
          <img alt="" className="absolute h-[106.45%] left-[32.5%] max-w-none top-[-3.37%] w-[80.06%]" src={imgBuildingBlocksMultiRatioItems43} />
        </div>
        <CarouselText />
      </div>
      <div className="absolute content-stretch flex flex-col h-[264px] items-start left-[25px] overflow-clip rounded-[28px] top-[539px] w-[351px]" data-name="Building blocks/Multi-ratio items/4:3">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[28px]">
          <img alt="" className="absolute h-[105.97%] left-[33.29%] max-w-none top-[-2.96%] w-[79.7%]" src={imgBuildingBlocksMultiRatioItems44} />
        </div>
        <CarouselText1 />
      </div>
      <div className="absolute content-stretch flex flex-col h-[264px] items-start left-[25px] overflow-clip rounded-[28px] top-[813px] w-[351px]" data-name="Building blocks/Multi-ratio items/4:3">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[28px]">
          <img alt="" className="absolute h-[111.67%] left-[31.71%] max-w-none top-[-5.84%] w-[83.99%]" src={imgBuildingBlocksMultiRatioItems45} />
        </div>
        <CarouselText2 />
      </div>
      <div className="absolute content-stretch flex flex-col h-[264px] items-start left-[25px] overflow-clip rounded-[28px] top-[1087px] w-[351px]" data-name="Building blocks/Multi-ratio items/4:3">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[28px]">
          <div className="absolute bg-[#ece6f0] inset-0 rounded-[28px]" />
          <img alt="" className="absolute max-w-none mix-blend-luminosity object-contain rounded-[28px] size-full" src={imgBuildingBlocksMultiRatioItems46} />
        </div>
        <CarouselText3 />
      </div>
      <div className="absolute content-stretch flex flex-col h-[264px] items-start left-[25px] overflow-clip rounded-[28px] top-[1361px] w-[351px]" data-name="Building blocks/Multi-ratio items/4:3">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[28px]">
          <div className="absolute bg-[#ece6f0] inset-0 rounded-[28px]" />
          <img alt="" className="absolute max-w-none mix-blend-luminosity object-contain rounded-[28px] size-full" src={imgBuildingBlocksMultiRatioItems46} />
        </div>
        <CarouselText4 />
      </div>
      <p className="-translate-x-1/2 absolute font-['Luckiest_Guy:Regular',sans-serif] h-[100px] leading-[normal] left-[200px] not-italic text-[48px] text-center text-white top-[108px] w-[354px]">SELECIONE SEU TUTOR</p>
    </div>
  );
}