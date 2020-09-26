import BigNumber from "bignumber.js";

type BigNumberConfig = BigNumber.Config;
type BigNumberConstructor = BigNumber.Constructor;
type BigNumberFormat = BigNumber.Format;
type BigNumberInstance = BigNumber.Instance;
type BigNumberModuloMode = BigNumber.ModuloMode;
type BigNumberRoundingMode = BigNumber.RoundingMode;
type BigNumberValue = BigNumber.Value;

declare global {
  const BigNumber: BigNumber.Constructor;
  type BigNumber = BigNumber.Instance;

  namespace BigNumber {
    type Config = BigNumberConfig;
    type Constructor = BigNumberConstructor;
    type Format = BigNumberFormat;
    type Instance = BigNumberInstance;
    type ModuloMode = BigNumberModuloMode;
    type RoundingMode = BigNumberRoundingMode;
    type Value = BigNumberValue;
  }
}
