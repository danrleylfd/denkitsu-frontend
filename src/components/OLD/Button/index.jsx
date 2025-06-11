import { BtnContainer, Btn, Spinner } from "./styles"

export default function Button({ type = "button", variant = "primary", size = "sm", $rounded = false, $squared = false, loading = false, disabled = false, children, ...rest }) {
  return (
    <BtnContainer>
      <Btn
        type={type}
        className={[variant, !loading ? size : "icon"].join(" ")}
        $rounded={$rounded}
        $squared={$squared}
        $loading={loading}
        disabled={loading || disabled}
        {...rest}
      >
        {loading && <Spinner />} {children}
      </Btn>
    </BtnContainer>
  )
}
