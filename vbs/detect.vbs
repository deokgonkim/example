strComputer = "." 
Set objWMIService = GetObject("winmgmts:\\" & strComputer & "\root\CIMV2") 
Set colItems = objWMIService.ExecQuery( _
    "SELECT * FROM Win32_BaseBoard",,48) 
For Each objItem in colItems 
    Wscript.echo " "
    Wscript.echo "===================="
    Wscript.echo "WIN32_Baseboard: " 
    Wscript.echo "====================" 
    Wscript.echo "Caption: " & objItem.Caption 
    Wscript.echo "Description: " & objItem.Description 
    Wscript.echo "Manufacturer: " & objItem.Manufacturer 
    Wscript.echo "Model: " & objItem.Model 
    Wscript.echo "Name: " & objItem.Name 
    Wscript.echo "OtherIdentifyingInfo: " & objItem.OtherIdentifyingInfo 
    Wscript.echo "PartNumber: " & objItem.PartNumber 
    Wscript.echo "Product: " & objItem.Product 
    Wscript.echo "SerialNumber: " & objItem.SerialNumber 
    Wscript.echo "SKU: " & objItem.SKU 
    Wscript.echo "Status: " & objItem.Status 
    Wscript.echo "Tag: " & objItem.Tag 
    Wscript.echo "Version: " & objItem.Version 
Next

Set objWMIService = GetObject("winmgmts:\\" & strComputer & "\root\CIMV2") 
Set colItems = objWMIService.ExecQuery( _
    "SELECT * FROM Win32_BIOS",,48) 
For Each objItem in colItems 
    Wscript.echo " "
    Wscript.echo "===================="
    Wscript.echo "WIN32_BIOS: " 	
    Wscript.echo "===================="	
    Wscript.echo "Caption: " & objItem.Caption 
    Wscript.echo "Description: " & objItem.Description 
    Wscript.echo "Manufacturer: " & objItem.Manufacturer 
    Wscript.echo "Description: " & objItem.Description 
    Wscript.echo "IdentificationCode: " & objItem.IdentificationCode 
    Wscript.echo "Name: " & objItem.Name 
    Wscript.echo "SerialNumber: " & objItem.SerialNumber 
    Wscript.echo "Version: " & objItem.Version 
Next


Set objWMIService = GetObject("winmgmts:\\" & strComputer & "\root\CIMV2") 
Set colItems = objWMIService.ExecQuery( _
    "SELECT * FROM Win32_SystemEnclosure",,48) 
For Each objItem in colItems 
    Wscript.echo " "
    Wscript.echo "===================="
    Wscript.echo "WIN32_SystemEnclosure: " 		
    Wscript.echo "===================="
    Wscript.echo "Caption: " & objItem.Caption 
    Wscript.echo "Description: " & objItem.Description 
    Wscript.echo "Manufacturer: " & objItem.Manufacturer 
    Wscript.echo "Model: " & objItem.Model 
    Wscript.echo "Name: " & objItem.Name 
    Wscript.echo "OtherIdentifyingInfo: " & objItem.OtherIdentifyingInfo 
    Wscript.echo "PartNumber: " & objItem.PartNumber 
    Wscript.echo "SerialNumber: " & objItem.SerialNumber 
    Wscript.echo "SKU: " & objItem.SKU 
    Wscript.echo "SMBIOSAssetTag: " & objItem.SMBIOSAssetTag 
    Wscript.echo "Status: " & objItem.Status 
    Wscript.echo "Tag: " & objItem.Tag 
    Wscript.echo "Version: " & objItem.Version 
Next


Set objWMIService = GetObject("winmgmts:\\" & strComputer & "\root\CIMV2") 
Set colItems = objWMIService.ExecQuery( _
    "SELECT * FROM Win32_ComputerSystemProduct",,48) 
For Each objItem in colItems 
    Wscript.echo " "
    Wscript.echo "===================="
    Wscript.echo "WIN32_ComputerSystemProduct: " 		
    Wscript.echo "===================="
    Wscript.echo "Caption: " & objItem.Caption 
    Wscript.echo "Description: " & objItem.Description 
    Wscript.echo "IdentifyingNumber: " & objItem.IdentifyingNumber 
    Wscript.echo "Name: " & objItem.Name 
    Wscript.echo "SKUNumber: " & objItem.SKUNumber 
    Wscript.echo "UUID: " & objItem.UUID 
    Wscript.echo "Vendor: " & objItem.Vendor 
    Wscript.echo "Version: " & objItem.Version 
Next

Set objWMIService = GetObject("winmgmts:\\" & strComputer & "\root\CIMV2") 
Set colItems = objWMIService.ExecQuery( _
    "SELECT * FROM Win32_ComputerSystem",,48) 
For Each objItem in colItems 
    Wscript.echo " "
    Wscript.echo "===================="
    Wscript.echo "WIN32_ComputerSystem : " 		
    Wscript.echo "===================="
    Wscript.echo "Caption: " & objItem.Caption 
    Wscript.echo "Description: " & objItem.Description 
    Wscript.echo "Manufacturer: " & objItem.Manufacturer
    Wscript.echo "Model: " & objItem.Model 
    Wscript.echo "Name: " & objItem.Name 
    Wscript.echo "NameFormat: " & objItem.NameFormat 
    Wscript.echo "NumberOfLogicalProcessors: " & objItem.NumberOfLogicalProcessors
    Wscript.echo "NumberOfProcessors: " & objItem.NumberOfProcessors 
    Wscript.echo "PCSystemType: " & objItem.PCSystemType 
    Wscript.echo "Status: " & objItem.Status 
    Wscript.echo "SystemType: " & objItem.SystemType 
    Wscript.echo "TotalPhysicalMemory: " & objItem.TotalPhysicalMemory 
Next



