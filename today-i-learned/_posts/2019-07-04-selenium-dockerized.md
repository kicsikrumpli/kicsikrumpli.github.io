---
layout: post
title:  "TIL: Selenium DOckerized"
date:   2019-07-04 15:37:54 +0200
categories: til docker selenium python
---

## Tl;dr
run selenium script in docker container with headless chrome and chromedriver

## Dockerfile
````Dockerfile
FROM ubuntu

RUN apt-get update && apt-get install -y python3 \
    python3-pip \
    unzip \
    curl

# get chrome
RUN curl https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -o /chrome.deb
RUN dpkg -i /chrome.deb || apt-get install -yf

# get chromedriver
RUN curl https://chromedriver.storage.googleapis.com/75.0.3770.90/chromedriver_linux64.zip -o /usr/bin/chromedriver.zip
RUN unzip /usr/bin/chromedriver.zip -d /usr/bin/
RUN chmod +x /usr/bin/chromedriver

# chrome & chromedriver paths expected by python script
ENV CHROME_PATH="/usr/bin/google-chrome"
ENV CHROME_DRIVER_PATH="/usr/bin/chromedriver"
````

## Python Script
````Python
# set up chrome
chrome_options = Options()
chrome_options.add_argument("--headless")
# otherwise will not run b/c of resource limitation of the container
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.add_argument("--no-sandbox")
chrome_options.binary_location = CHROME_PATH

driver = webdriver.Chrome(
    executable_path=CHROME_DRIVER_PATH,
    options=chrome_options)

# do the clickety clack
driver.get(URL)
driver.find_element_by_id(BUTTON_ID).click()
original_window = driver.current_window_handle
popup_window = [handle for handle in driver.window_handles if handle != original_window][0]
driver.switch_to.window(popup_window)
# waiting for input field to appear
WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, INPUT_ID)))
driver.find_element_by_id(INPUT_ID).send_keys(inputText)
driver.find_element_by_id(NEXT_BUTTON_ID).click()
textfieldText = driver.find_element_by_id(TEXTFIELD_ID).text
````
