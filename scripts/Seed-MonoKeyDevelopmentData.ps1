param(
    [string]$OwnerId = 'local-development-seed-user'
)

$ErrorActionPreference = 'Stop'
$psql = 'C:\Program Files\PostgreSQL\15\bin\psql.exe'

if (-not (Test-Path -LiteralPath $psql)) {
    throw "psql was not found at $psql."
}

if (-not ('MonoKeyCredentialReader' -as [type])) {
    Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

public static class MonoKeyCredentialReader
{
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    private struct Credential
    {
        public uint Flags;
        public uint Type;
        public IntPtr TargetName;
        public IntPtr Comment;
        public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten;
        public uint CredentialBlobSize;
        public IntPtr CredentialBlob;
        public uint Persist;
        public uint AttributeCount;
        public IntPtr Attributes;
        public IntPtr TargetAlias;
        public IntPtr UserName;
    }

    [DllImport("advapi32.dll", CharSet = CharSet.Unicode, EntryPoint = "CredReadW", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool CredRead(string target, int type, int reservedFlag, out IntPtr credentialPointer);

    [DllImport("advapi32.dll")]
    private static extern void CredFree(IntPtr buffer);

    public static string Read(string target)
    {
        IntPtr pointer;
        if (!CredRead(target, 1, 0, out pointer))
            throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());

        try
        {
            Credential credential = Marshal.PtrToStructure<Credential>(pointer);
            return Marshal.PtrToStringUni(credential.CredentialBlob, checked((int)credential.CredentialBlobSize / 2));
        }
        finally
        {
            CredFree(pointer);
        }
    }
}
'@
}

$connectionString = [MonoKeyCredentialReader]::Read('MonoKey.Development.PostgreSql')
$builder = [System.Data.Common.DbConnectionStringBuilder]::new()
$builder.set_ConnectionString($connectionString)
$databaseHost = [string]$builder['Host']
$databasePort = [string]$builder['Port']
$databaseUser = [string]$builder['Username']
$databaseName = [string]$builder['Database']

if ([string]::IsNullOrWhiteSpace($databaseHost) -or
    [string]::IsNullOrWhiteSpace($databasePort) -or
    [string]::IsNullOrWhiteSpace($databaseUser) -or
    [string]::IsNullOrWhiteSpace($databaseName)) {
    $availableKeys = ($builder.Keys | ForEach-Object { [string]$_ }) -join ', '
    throw "The stored connection string could not be parsed. Available keys: $availableKeys"
}

if ($databaseHost -notin @('localhost','127.0.0.1') -or $databaseName -ne 'monokey_dev') { throw 'Seeding is restricted to local monokey_dev.' }

try {
    $env:PGPASSWORD = [string]$builder['Password']
    $env:PGSSLMODE = ([string]$builder['SSL Mode']).ToLowerInvariant()
    & $psql `
        --host $databaseHost `
        --port $databasePort `
        --username $databaseUser `
        --dbname $databaseName `
        --no-password `
        --set ON_ERROR_STOP=1 `
        --set "owner_id=$OwnerId" `
        --file "$PSScriptRoot\sql\seed-development.sql"

    if ($LASTEXITCODE -ne 0) {
        throw 'Development seed failed.'
    }
}
finally {
    $env:PGPASSWORD = $null
    $env:PGSSLMODE = $null
    $connectionString = $null
}
