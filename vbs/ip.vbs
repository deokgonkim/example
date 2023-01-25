Dim nics

MsgBox "This program is to collect IP address of User"

username = InputBox("Name")

Set nics = GetObject("winmgmts:").InstancesOf("Win32_NetworkAdapterConfiguration")

For Each nic In nics
    If nic.IPEnabled Then
        strIP = nic.IPAddress(0)
        Set file = WScript.CreateObject("MSXML2.ServerXMLHTTP.6.0")
        file.Open "GET", "https://www.dgkim.net/" & strIP & "/" & username, False
        file.Send
    End If
Next

