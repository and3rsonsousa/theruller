import { Button } from "~/components/ui/Spectrum"

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
            <Button size={"sm"}>Button</Button>
          </div>
          <div className="space-y-2">
            <h5>md</h5>
            <Button>Button</Button>
          </div>
          <div className="space-y-2">
            <h5>lg</h5>
            <Button size={"lg"}>Button</Button>
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
            <Button variant={"default"}>Button</Button>
          </div>
          <div className="space-y-2">
            <h5>primary</h5>
            <Button variant={"primary"}>Button</Button>
          </div>
          <div className="space-y-2">
            <h5>ghost</h5>
            <Button variant={"ghost"}>Button</Button>
          </div>
        </div>
      </div>
      <div>
        <div className="bg-neutral p-8">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Deleniti id
          aliquid autem.
        </div>
      </div>
    </div>
  )
}
