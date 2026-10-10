const {withAndroidManifest,withMainActivity,withDangerousMod,withInfoPlist,withEntitlementsPlist,withXcodeProject}=require('@expo/config-plugins');
const fs=require('node:fs'),path=require('node:path'),plist=require('@expo/plist');
function withMonoKeyAutofill(config) {
 const variant=process.env.EXPO_PUBLIC_APP_ENV;
 const reviewed=process.env.EXPO_PUBLIC_NATIVE_AUTOFILL_REVIEWED==='true';
 if(reviewed && variant!=='test')throw Error('Native autofill enablement is limited to reviewed TEST builds.');
 const group=`group.${config.ios.bundleIdentifier}.autofill`;
 const namespace=`monokey:${variant}:${variant==='dev'?'demo-monokey':process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}:v2`;
 config=withAndroidManifest(config,c=>{
  const app=c.modResults.manifest.application[0];
  app.service=app.service??[];
  if(!app.service.some(s=>s.$['android:name']==='expo.modules.monokeyautofill.MonoKeyAutofillService'))app.service.push({$:{'android:name':'expo.modules.monokeyautofill.MonoKeyAutofillService','android:label':'Mono Key','android:permission':'android.permission.BIND_AUTOFILL_SERVICE','android:exported':'true','android:enabled':String(reviewed)},'intent-filter':[{'action':[{$:{'android:name':'android.service.autofill.AutofillService'}}]}]});
  app.activity=app.activity??[];if(!app.activity.some(a=>a.$['android:name']==='.MonoKeyAutofillActivity'))app.activity.push({$:{'android:name':'.MonoKeyAutofillActivity','android:exported':'false','android:excludeFromRecents':'true','android:theme':'@style/AppTheme','android:launchMode':'standard'}});
  return c;
 });
 config=withMainActivity(config,c=>{if(c.modResults.language!=='kt')throw Error('Autofill requires the current Kotlin Expo template.');c.modResults.contents=c.modResults.contents.replace(/(?<!open )class MainActivity/, 'open class MainActivity');return c;});
 config=withDangerousMod(config,['android',async c=>{
  const packageName=c.android.package;const folder=path.join(c.modRequest.platformProjectRoot,'app/src/main/java',...packageName.split('.'));fs.mkdirSync(folder,{recursive:true});
  fs.writeFileSync(path.join(folder,'MonoKeyAutofillActivity.kt'),`package ${packageName}\nimport android.os.Bundle\nimport android.view.WindowManager\nclass MonoKeyAutofillActivity : MainActivity() {\n override fun onCreate(savedInstanceState: Bundle?) {\n  window.setFlags(WindowManager.LayoutParams.FLAG_SECURE,WindowManager.LayoutParams.FLAG_SECURE)\n  super.onCreate(savedInstanceState)\n }\n}\n`);
  return c;
 }]);
 config=withInfoPlist(config,c=>{Object.assign(c.modResults,{MonoKeyAutofillGroup:group,MonoKeyAutofillNamespace:namespace});return c;});
 config=withEntitlementsPlist(config,c=>{c.modResults['com.apple.security.application-groups']=[...new Set([...(c.modResults['com.apple.security.application-groups']??[]),group])];return c;});
 config=withXcodeProject(config,c=>{
  const name='MonoKeyCredentialProvider',root=c.modRequest.projectRoot,folder=path.join(c.modRequest.platformProjectRoot,name);fs.mkdirSync(folder,{recursive:true});
  for(const file of ['CredentialProviderViewController.swift','bridge.html'])fs.copyFileSync(path.join(root,'native/ios-autofill',file),path.join(folder,file));
  const bridge=path.join(root,'.native-autofill/bridge.js');if(!fs.existsSync(bridge))throw Error('Run node scripts/Build-MonoKeyCredentialExtension.mjs before iOS prebuild.');fs.copyFileSync(bridge,path.join(folder,'bridge.js'));
  fs.writeFileSync(path.join(folder,'Info.plist'),plist.default.build({CFBundleDisplayName:'Mono Key',CFBundleExecutable:'$(EXECUTABLE_NAME)',CFBundleIdentifier:'$(PRODUCT_BUNDLE_IDENTIFIER)',CFBundleName:'$(PRODUCT_NAME)',CFBundlePackageType:'XPC!',CFBundleShortVersionString:config.version,CFBundleVersion:config.ios.buildNumber??'1',MonoKeyAutofillGroup:group,MonoKeyAutofillNamespace:namespace,MonoKeyAutofillReviewed:reviewed,NSExtension:{NSExtensionPointIdentifier:'com.apple.authentication-services-credential-provider-ui',NSExtensionPrincipalClass:'$(PRODUCT_MODULE_NAME).CredentialProviderViewController'}}));
  fs.writeFileSync(path.join(folder,'Provider.entitlements'),plist.default.build({'com.apple.security.application-groups':[group],'com.apple.developer.authentication-services.autofill-credential-provider':true}));
  const project=c.modResults;const targets=project.pbxNativeTargetSection();let target=Object.entries(targets).find(([,value])=>value && typeof value==='object' && value.name?.replaceAll('"','')===name);
  if(!target){const added=project.addTarget(name,'app_extension',name,`${config.ios.bundleIdentifier}.credentials`);target=[added.uuid,added.pbxNativeTarget];project.addBuildPhase([`${name}/CredentialProviderViewController.swift`],'PBXSourcesBuildPhase','Sources',target[0]);project.addBuildPhase([`${name}/bridge.html`,`${name}/bridge.js`],'PBXResourcesBuildPhase','Resources',target[0]);project.addBuildPhase([],'PBXFrameworksBuildPhase','Frameworks',target[0]);}
  const lists=project.pbxXCConfigurationList(),builds=project.pbxXCBuildConfigurationSection();for(const item of lists[target[1].buildConfigurationList].buildConfigurations){Object.assign(builds[item.value].buildSettings,{INFOPLIST_FILE:`"${name}/Info.plist"`,CODE_SIGN_ENTITLEMENTS:`"${name}/Provider.entitlements"`,SWIFT_VERSION:'5.9',IPHONEOS_DEPLOYMENT_TARGET:'16.4',TARGETED_DEVICE_FAMILY:'"1,2"',APPLICATION_EXTENSION_API_ONLY:'YES',GENERATE_INFOPLIST_FILE:'NO',CODE_SIGN_STYLE:'Automatic',CLANG_ENABLE_MODULES:'YES'});}
  return c;
 });
 return config;
}
module.exports=withMonoKeyAutofill;
