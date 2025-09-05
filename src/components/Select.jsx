import { Check, ChevronsUpDown } from "lucide-react"
import * as RadixSelect from "@radix-ui/react-select"
import Button from "./Button"

const Select = ({
  value,
  onValueChange,
  options = [],
  placeholder,
  disabled,
  className
}) => {
  const triggerClasses = [
    "flex gap-1 w-full items-center rounded-full pr-1 transition-all h-10",
    "bg-lightBg-tertiary text-lightFg-secondary",
    "dark:bg-darkBg-tertiary dark:text-darkFg-secondary",
    "hover:bg-lightBg-secondary dark:hover:bg-darkBg-secondary",
    "focus:outline-none focus:ring-1 focus:ring-primary-base",
    "data-[placeholder]:text-lightFg-tertiary dark:data-[placeholder]:text-darkFg-tertiary",
    className
  ].filter(Boolean).join(" ")

  const renderOptionItem = (option) => (
    <RadixSelect.Item
      key={option.value}
      value={option.value}
      disabled={option.disabled}
      className="relative flex items-center px-6 py-2 rounded-md text-sm text-lightFg-primary dark:text-darkFg-primary cursor-pointer select-none hover:bg-primary-base/10 outline-none data-[highlighted]:bg-primary-base/20">
      <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
      <RadixSelect.ItemIndicator className="absolute left-0 w-6 inline-flex items-center justify-center">
        <Check size={16} />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  )

  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <RadixSelect.Trigger className={triggerClasses}>
        <div className="flex-1 text-left px-2 text-base">
          <RadixSelect.Value placeholder={placeholder} />
        </div>
        <RadixSelect.Icon asChild>
          <Button variant="outline" size="icon" $rounded disabled={disabled} className="cursor-pointer">
            <ChevronsUpDown size={16} />
          </Button>
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content position="popper" sideOffset={5} className="w-[--radix-select-trigger-width] bg-lightBg-primary dark:bg-darkBg-primary rounded-lg shadow-lg border border-bLight dark:border-bDark z-50">
          <RadixSelect.Viewport className="p-2 max-h-[256px] overflow-y-auto">
            {options.map((groupOrOption, index) =>
              groupOrOption.options ? (
                <RadixSelect.Group key={groupOrOption.label || index}>
                  {groupOrOption.label && <RadixSelect.Label className="px-6 py-2 text-sm text-lightFg-tertiary dark:text-darkFg-tertiary">{groupOrOption.label}</RadixSelect.Label>}
                  {groupOrOption.options.map(renderOptionItem)}
                </RadixSelect.Group>
              ) : (
                renderOptionItem(groupOrOption)
              )
            )}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
}

export default Select
