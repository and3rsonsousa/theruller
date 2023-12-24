import { SpectrumButton } from "~/components/ui/spectrum/Spectrum"

export default function UI() {
  return (
    <div className="container">
      <div className="p-8">
        <div className=" text-center">
          <h3 className="text-xl">Size</h3>
        </div>
        <div className="flex justify-center gap-8 ">
          <div className="space-y-2">
            <h5>sm</h5>
            <SpectrumButton size={"sm"}>Button</SpectrumButton>
          </div>
          <div className="space-y-2">
            <h5>md</h5>
            <SpectrumButton>Button</SpectrumButton>
          </div>
          <div className="space-y-2">
            <h5>lg</h5>
            <SpectrumButton size={"lg"}>Button</SpectrumButton>
          </div>
        </div>
      </div>
      <div className="p-8">
        <div className=" text-center">
          <h3 className="text-xl">Variant</h3>
        </div>
        <div className="flex justify-center gap-8 p-4">
          <div className="space-y-2">
            <h5>default</h5>
            <SpectrumButton variant={"default"}>Button</SpectrumButton>
          </div>
          <div className="space-y-2">
            <h5>primary</h5>
            <SpectrumButton variant={"primary"}>Button</SpectrumButton>
          </div>
          <div className="space-y-2">
            <h5>ghost</h5>
            <SpectrumButton variant={"ghost"}>Button</SpectrumButton>
          </div>
        </div>
      </div>
    </div>
  )
}
