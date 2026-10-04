param([Security.SecureString]$ConnectionString)
$ErrorActionPreference = 'Stop'
if (-not ('MonoKeyCredentialWriter' -as [type])) {
    Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class MonoKeyCredentialWriter {
    [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)]
    private struct Credential {
        public uint Flags,Type; public string TargetName,Comment;
        public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten;
        public uint BlobSize; public IntPtr Blob; public uint Persist,AttributeCount;
        public IntPtr Attributes; public string TargetAlias,UserName;
    }
    [DllImport("advapi32.dll",CharSet=CharSet.Unicode,EntryPoint="CredWriteW",SetLastError=true)]
    private static extern bool CredWrite(ref Credential value,uint flags);
    public static void Write(string value) {
        var blob=Marshal.StringToCoTaskMemUni(value);
        try {
            var c=new Credential { Type=1,TargetName="MonoKey.Development.PostgreSql",BlobSize=(uint)(value.Length*2),Blob=blob,Persist=2,UserName="MonoKey" };
            if(!CredWrite(ref c,0)) throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());
        } finally { Marshal.ZeroFreeCoTaskMemUnicode(blob); }
    }
}
'@
}
if ($null -eq $ConnectionString) { $ConnectionString = Read-Host 'Development PostgreSQL connection string' -AsSecureString }
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($ConnectionString)
try { [MonoKeyCredentialWriter]::Write([Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)) }
finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
Write-Host 'Development credential stored in Windows Credential Manager under MonoKey.Development.PostgreSql.'
