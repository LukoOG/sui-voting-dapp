interface SuiEnv {
  versionObject: string;
  publisherObject: string;
  packageId: string;
}


export default const suiEnv: SuiEnv = {
	version: process.env.NEXT_PUBLIC_SUI_VERSION || "default-version",
	publisherObject: process.env.NEXT_PUBLIC_PUBLISHER_OBJECT || "default-publisher-object",
	packageId: process.env.NEXT_PUBLIC_PACKAGE_ID || "default-package-id",
}