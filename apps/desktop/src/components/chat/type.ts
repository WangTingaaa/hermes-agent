export interface IntroCopy {
  headline: string
  body: string
}

export interface IntroCopyRecord extends IntroCopy {
  personality: string
}

export interface IntroProps {
  personality?: string
  seed?: number
}
