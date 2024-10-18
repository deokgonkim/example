# about errors

## USBError: Access denied

- from copilot
```
To fix the usb.core.USBError: [Errno 13] Access denied (insufficient permissions) error, you need to set up the appropriate udev rules to grant your user access to the USB device. Here are the steps:

Identify the USB device: You need the vendor ID and product ID of your USB device. In your case, they are 0x1fc9 and 0x2016 respectively.

Create a udev rule: Create a new udev rule file to grant permissions to the USB device.

Reload udev rules: Apply the new udev rules.

Step-by-Step Instructions
Create a udev rule file:
sudo nano /etc/udev/rules.d/99-usb.rules

Add the following line to the file:
SUBSYSTEM=="usb", ATTR{idVendor}=="1fc9", ATTR{idProduct}=="2016", MODE="0666"

Save and close the file: Press Ctrl+O to save and Ctrl+X to exit the editor.

Reload udev rules:
sudo udevadm control --reload-rules
sudo udevadm trigger

Unplug and replug the USB device: This ensures the new rules take effect.

After completing these steps, try running your script again. The permissions error should be resolved.
```
