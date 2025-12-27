---
title: How fiber optic cables work
date: 2025-09-04
type: musings
tags:
  - Information
description: Think of a fiber optic cable as a super-thin strand of glass (about
  as thin as a human hair) that carries information using light instead of
  electricity. It's like a tiny, flexible glass tube that light can travel
  through.
published: true
draft: false
featured: false
---
I was reading [_Cryptonomicon_](https://www.amazon.in/Cryptonomicon-Neal-Stephenson/dp/0099410672/ref=tmm_pap_swatch_0) by Neal Stephenson, and yesterday I read this and the part in bold. caught my eye:

> in a cubicled office suite leased by Novus Ordo Seclorum Systems Incorporated, sandwiched between an escrow company and a discount travel agent in the most banal imaginable disco-era office building in Los Altos, California, a modem wakes up and spews noise down a wire. **The noise eventually travels under the Pacific as a pattern of scintillations in a filament of glass so transparent that if the ocean itself were made out of the same stuff, you’d be able to see Hawaii from California.** Eventually the information reaches Randy’s computer, which spews noise back. The modem in Los Altos is one of half a dozen that are all connected to the back of the same computer, an entirely typical looking tower PC of a generic brand, which has been running, night and day, for about eight months now. They turned its monitor off about seven months ago because it was just wasting electricity. Then John Cantrell (who is on the board of Novus Ordo Seclorum Systems Inc., and made arrangements to put it in the company’s closet) borrowed the monitor because one of the coders who was working on the latest upgrade of Ordo needed a second screen. Later, Randy disconnected the keyboard and mouse because, without a monitor, only bad information could be fed into the system. Now it is just a faintly hissing off-white obelisk with no human interface other than a cyclopean green LED staring out over a dark landscape of empty pizza boxes.

The reference is to optic fiber cables, and reading this got me thinking about how optic fiber cables work and why we use them instead of copper wires. I asked Claude, and I now know one thing I didn't yesterday:

> ## Fiber Optic Cables: The Complete Beginner's Guide
> 
> ## What is a fiber optic cable?
> 
> Think of a fiber optic cable as a super-thin strand of glass (about as thin as a human hair) that carries information using light instead of electricity. It's like a tiny, flexible glass tube that light can travel through.
> 
> Imagine you're in a dark room with a flashlight. If you had a magical glass straw that could bend and twist but still carry your flashlight beam from one end to the other without it escaping - that's basically what a fiber optic cable does, but with special light signals carrying data.
> 
> ### The Physical Structure
> 
> A fiber optic cable isn't just one piece of glass. It's actually built in layers, like a very high-tech candy cane:
> 
> 1.  **The Core** (5-10 micrometers for single-mode, 50-62.5 for multi-mode): This is the highway where the light travels. It's made of ultra-pure glass - so pure that if you had a window made of this glass that was several miles thick, you could still see through it clearly.
>     
> 2.  **The Cladding** (125 micrometers): This surrounds the core and is also made of glass, but with different properties that make light bounce back into the core instead of escaping. It's like having walls made of mirrors in a hallway.
>     
> 3.  **Buffer Coating** (250-900 micrometers): A plastic coating that protects the delicate glass from moisture and physical damage.
>     
> 4.  **Strengthening Fibers**: Often made of Kevlar (yes, the bulletproof vest material), these protect the cable from being stretched.
>     
> 5.  **Outer Jacket**: The final protective layer that you actually see and touch.
>     
> 
> ## What is it used for?
> 
> Fiber optic cables are everywhere, even if you don't see them. They're the backbone of modern communication:
> 
> ### Internet and Communications
> 
> *   **Your Home Internet**: When your ISP says "fiber to the home," they mean a fiber optic cable runs right to your house. This can deliver speeds of 1-10 Gigabits per second (that's downloading a full HD movie in seconds, not minutes)
>     
> *   **Submarine Cables**: Over 400 underwater fiber optic cables crisscross our oceans, carrying 99% of international data. The longest one, SEA-ME-WE 3, stretches 39,000 kilometers!
>     
> *   **5G Networks**: Those new 5G cell towers? They're connected to each other and the internet backbone using fiber optics
>     
> *   **Business Networks**: Every major office building has fiber optics connecting computers, servers, and different floors
>     
> 
> ### Entertainment
> 
> *   **Cable TV**: Modern cable services use fiber to deliver 500+ channels in HD and 4K
>     
> *   **Streaming Services**: Netflix, YouTube, and others rely on massive fiber networks to deliver content to local servers near you
>     
> *   **Gaming**: Online gaming platforms use fiber for low-latency connections (that's why pros care about their "ping")
>     
> 
> ### Specialized Applications
> 
> *   **Medical Field**:
>     
>     *   Endoscopes let doctors see inside your body without major surgery
>         
>     *   Laser surgery uses fiber to deliver precise laser light
>         
>     *   Medical imaging equipment uses fiber for data transfer
>         
> *   **Military and Aerospace**: Used in aircraft, ships, and secure communications because they're immune to electromagnetic pulses
>     
> *   **Industrial Sensors**: Monitor temperature, pressure, and strain in harsh environments like oil rigs and nuclear plants
>     
> *   **Decorative Lighting**: Those color-changing fiber optic lamps and starry ceiling effects in home theaters
>     
> 
> ## Why is it used instead of copper?
> 
> The switch from copper to fiber is like upgrading from a bicycle to a sports car, but the reasons go deeper than just speed:
> 
> ### The Physics Problem with Copper
> 
> When electricity travels through copper wire, several annoying things happen:
> 
> *   **Resistance**: The electrons literally bump into atoms in the copper, creating heat and losing energy (why phone chargers get warm)
>     
> *   **Electromagnetic Fields**: Moving electrons create magnetic fields that can interfere with nearby cables
>     
> *   **Signal Degradation**: The electrical signal gets weaker and more distorted the farther it travels
>     
> *   **Skin Effect**: At high frequencies, electricity only flows on the outer surface of the wire, wasting the rest
>     
> 
> Light in fiber doesn't have these problems because photons (light particles) don't interact with each other or create electromagnetic fields the same way electrons do.
> 
> ### Historical Context
> 
> In the 1970s, telephone companies were running out of capacity with copper cables. A single conversation required one pair of copper wires. To add more capacity, they had to lay more cables, which was expensive and running out of physical space in cable ducts. Then fiber optics came along - suddenly one thin fiber could carry thousands of conversations. It was like discovering you could fit a whole library on a USB stick instead of needing a truck full of books.
> 
> ## How is it better than copper?
> 
> Let's dive deep into why fiber dominates copper in almost every way:
> 
> ### 1\. **Speed - The Light Advantage**
> 
> *   **Copper Cable (Cat6)**: Maximum about 10 Gigabits per second, only for 55 meters
>     
> *   **Fiber Optic**: Current commercial systems do 400 Gigabits per second, with labs achieving over 1 Petabit per second
>     
> *   **Real World**: Downloading a 4K movie (25 GB):
>     
>     *   Good copper connection (100 Mbps): 33 minutes
>         
>     *   Fiber connection (1 Gbps): 3.3 minutes
>         
>     *   High-end fiber (10 Gbps): 20 seconds
>         
> 
> ### 2\. **Distance - Going the Extra Mile (Literally)**
> 
> *   **Copper Ethernet**: Signal needs boosting every 100 meters
>     
> *   **Copper Coax**: Maybe 500 meters before significant loss
>     
> *   **Multi-mode Fiber**: 550 meters to 2 kilometers
>     
> *   **Single-mode Fiber**: 40-80 kilometers without amplification
>     
> *   **Special Long-haul Fiber**: 100+ kilometers
>     
> 
> Example: A copper cable from New York to Los Angeles would need about 45,000 signal boosters. A fiber cable might need only 50.
> 
> ### 3\. **Bandwidth - The Information Superhighway**
> 
> Think of bandwidth like lanes on a highway:
> 
> *   **Copper**: It's like having a 2-lane road. You can improve traffic flow, but you're fundamentally limited
>     
> *   **Fiber**: It's like having a 1000-lane highway, and we're only using 10 lanes so far
>     
> 
> The theoretical limit of fiber is about 100 terabits per second per fiber. We're nowhere near hitting that ceiling. Meanwhile, copper hit its theoretical limits years ago.
> 
> ### 4\. **Interference - The Noise Problem**
> 
> Copper cables are like trying to have a conversation at a rock concert:
> 
> *   Affected by power lines, motors, fluorescent lights, microwaves
>     
> *   Rain and temperature changes affect signal quality
>     
> *   Crosstalk between adjacent cables (hearing other conversations)
>     
> *   Radio frequency interference (AM/FM radio, cell phones)
>     
> 
> Fiber is like being in a soundproof room:
> 
> *   Completely immune to electromagnetic interference
>     
> *   Doesn't conduct electricity (no lightning strike worries)
>     
> *   No crosstalk between fibers
>     
> *   Works perfectly next to high-voltage power lines
>     
> 
> ### 5\. **Security - The Spy Problem**
> 
> **Hacking Copper**:
> 
> *   Attach a device to the cable, read all the data
>     
> *   The cable emits electromagnetic radiation that can be intercepted from a distance
>     
> *   Hard to detect if someone is listening in
>     
> 
> **Hacking Fiber**:
> 
> *   Must physically break into the cable (breaks the light beam, immediately detected)
>     
> *   No electromagnetic emissions to intercept
>     
> *   Any tap causes measurable light loss, triggering alarms
>     
> *   Some secure facilities use fiber specifically because it's so hard to tap
>     
> 
> ### 6\. **Environmental Factors**
> 
> **Copper Downsides**:
> 
> *   Heavy (1000 feet of Cat6 = 35 pounds)
>     
> *   Copper mining is environmentally damaging
>     
> *   Copper is valuable (theft is a real problem - people steal copper cables)
>     
> *   Corrodes over time, especially in salt air
>     
> *   Conducts electricity (fire hazard, electrocution risk)
>     
> 
> **Fiber Advantages**:
> 
> *   Lightweight (1000 feet might weigh 4 pounds)
>     
> *   Made from silicon dioxide (basically sand) - abundant material
>     
> *   No resale value (nobody steals fiber for scrap)
>     
> *   Doesn't corrode or degrade from weather
>     
> *   No fire hazard, safe to handle
>     
> 
> ## How does it transmit data?
> 
> Let's really break down the journey of how your Instagram photo gets from your phone to your friend's phone across the world:
> 
> ### Step 1: Your Data Becomes Binary
> 
> Everything digital is converted to binary (1s and 0s):
> 
> *   The letter "A" = 01000001
>     
> *   A pixel of red color = 11111111 00000000 00000000
>     
> *   Your photo = millions of these binary codes
>     
> 
> ### Step 2: Binary Becomes Light - The Transmitter
> 
> The transmitter has three main parts:
> 
> 1.  **LED or Laser Diode**: Creates the light (lasers for long distance, LEDs for short)
>     
> 2.  **Driver Circuit**: Controls when the light turns on and off
>     
> 3.  **Optical Coupler**: Focuses the light into the fiber core
>     
> 
> The process:
> 
> *   Binary 1 = Light pulse ON
>     
> *   Binary 0 = Light pulse OFF
>     
> *   This happens billions of times per second (a 10 Gbps connection = 10 billion pulses per second)
>     
> 
> ### Step 3: The Light's Journey - Three Types of Travel
> 
> **Multi-mode Fiber** (short distances, cheaper):
> 
> *   Light takes multiple paths (modes) through the wider core
>     
> *   Like cars taking different routes through a city
>     
> *   Different paths = different arrival times = limited speed
>     
> *   Good for buildings, campuses (up to 2 km)
>     
> 
> **Single-mode Fiber** (long distances, faster):
> 
> *   Light takes only one path through the tiny core
>     
> *   Like a train on a single track - everyone arrives together
>     
> *   Much faster and goes much farther
>     
> *   Used for internet backbone, undersea cables
>     
> 
> ### Step 4: Staying Strong Over Distance
> 
> As light travels, it weakens due to:
> 
> *   **Absorption**: Some light is absorbed by impurities (even ultra-pure glass isn't perfect)
>     
> *   **Scattering**: Light bounces off microscopic imperfections
>     
> *   **Bending Losses**: Sharp bends cause some light to escape
>     
> 
> Solutions:
> 
> *   **Repeaters** (every 100 km): Convert light back to electricity, clean up the signal, convert back to light
>     
> *   **Optical Amplifiers** (every 80-100 km): Use special doped fiber that amplifies light directly without conversion
>     
> *   **Forward Error Correction**: Adds extra data that helps fix errors at the destination
>     
> 
> ### Step 5: Multiplexing - The Real Magic
> 
> One fiber doesn't just carry one signal. Using different colors (wavelengths) of light, we can send multiple signals simultaneously:
> 
> **Wave Division Multiplexing (WDM)**:
> 
> *   Like having multiple radio stations on different frequencies
>     
> *   Each color is a separate channel
>     
> *   Current systems use 80-100 different colors
>     
> *   Each color can carry 100+ Gbps
>     
> *   Total capacity: 8-10 Terabits per second per fiber!
>     
> 
> ### Step 6: Reception and Conversion
> 
> At the receiving end:
> 
> 1.  **Photodetector**: Converts light pulses back to electrical signals (like a solar cell but much more sensitive)
>     
> 2.  **Amplifier**: Boosts the weak electrical signal
>     
> 3.  **Clock Recovery**: Figures out the timing of the pulses
>     
> 4.  **Decoder**: Converts binary back to usable data
>     
> 
> ### Real-World Example: Your Netflix Stream
> 
> 1.  You click "play" on Stranger Things
>     
> 2.  Request travels as light through fiber to Netflix's server (maybe 5-50 milliseconds)
>     
> 3.  Netflix's server sends the video data back as billions of light pulses
>     
> 4.  The show streams at about 25 Mbps for 4K = 25 million bits per second
>     
> 5.  Each bit is a flash of light lasting 0.00000004 seconds
>     
> 6.  Your router converts it back to WiFi radio waves
>     
> 7.  Your TV shows the picture
>     
> 
> This entire round trip happens so fast that the video starts playing in under a second!
> 
> ## Types of Fiber Optic Cables You Might Encounter
> 
> ### Indoor vs Outdoor
> 
> **Indoor Cables**:
> 
> *   Flexible, easy to bend around corners
>     
> *   Fire-resistant jacket materials
>     
> *   Usually yellow (single-mode) or orange/aqua (multi-mode)
>     
> 
> **Outdoor Cables**:
> 
> *   Waterproof and UV resistant
>     
> *   Often filled with gel to prevent water damage
>     
> *   Armored versions for direct burial
>     
> *   Black jacket for UV protection
>     
> 
> ### By Application
> 
> **FTTH (Fiber to the Home)**: The holy grail of internet connections **FTTC (Fiber to the Cabinet)**: Fiber to your street corner, copper for the last bit **FTTN (Fiber to the Node)**: Fiber to your neighborhood, copper for the last mile **FTTP (Fiber to the Premises)**: Business version of FTTH
> 
> ## The Economics: Why Isn't Fiber Everywhere Yet?
> 
> ### Installation Costs
> 
> *   Digging trenches: $30,000-$100,000 per mile in cities
>     
> *   The fiber itself: $0.10-$1 per foot (cheap!)
>     
> *   Splicing and termination equipment: $5,000-$50,000
>     
> *   Labor: Skilled technicians needed
>     
> 
> ### The "Last Mile Problem"
> 
> Getting fiber from the street to your house is proportionally the most expensive part:
> 
> *   Need permits to dig up yards/driveways
>     
> *   Each house needs individual installation
>     
> *   May require new equipment inside the home
>     
> 
> This is why many places have fiber on main roads but still use copper for the final connection to homes.
> 
> ## Cool Facts and Mind-Blowing Statistics
> 
> *   **Speed of Light in Fiber**: 200,000 km/s (124,000 miles/second) - you could circle Earth 5 times in one second
>     
> *   **Capacity**: A single fiber strand can carry more data than all the copper cables in a typical telephone pole combined
>     
> *   **Thinness**: Some fibers are thinner than human hair but stronger than steel of the same diameter
>     
> *   **Purity**: The glass in fiber optic cables is 30 times more transparent than the purest water
>     
> *   **Energy Efficient**: Fiber systems use about 1 watt per gigabit, while copper uses about 5 watts
>     
> *   **Temperature Resistant**: Works from -40°F to +160°F (-40°C to +70°C)
>     
> *   **Longevity**: Properly installed fiber can last 25+ years (copper degrades in 5-10)
>     
> *   **Bend Radius**: Modern fiber can bend in a radius as small as 7.5mm without breaking
>     
> *   **Global Scale**: There's enough installed fiber optic cable to wrap around Earth 25,000 times
>     
> *   **Future Proof**: We're using less than 1% of fiber's theoretical capacity - plenty of room to grow
>     
> 
> ## The Future of Fiber
> 
> ### Emerging Technologies
> 
> *   **Hollow Core Fiber**: Light travels through air in the center, 50% faster than current fiber
>     
> *   **Multi-Core Fiber**: Multiple cores in one fiber, like having multiple lanes
>     
> *   **Twisted Light**: Using the spiral properties of light to pack more data
>     
> *   **Quantum Communication**: Using quantum properties for unhackable communication
>     
> 
> ### What This Means for You
> 
> *   8K video streaming will be normal
>     
> *   Virtual reality will be seamless
>     
> *   Working from home with zero lag
>     
> *   Instant downloads of massive files
>     
> *   Smart cities with millions of connected sensors
>     
> *   Telemedicine with real-time surgery assistance
>     
> 
> ## The Bottom Line
> 
> Fiber optic cables are thin strands of ultra-pure glass that use pulses of light to transmit data at incredible speeds over vast distances. They're superior to copper in every measurable way - faster, more reliable, more secure, and with almost unlimited potential for future growth.
> 
> While the technology seems like magic, it's really just very clever use of physics - bouncing light through glass tubes. As installation costs decrease and demand increases, fiber will eventually be as common as electricity in homes. We're living through the transition from the copper age to the light age of communication, and fiber optic cables are the foundation of this revolution.
> 
> The next time you stream a video, make a video call, or even just browse the web, remember that your data is literally traveling as beams of light through hair-thin glass fibers, racing around the world in fractions of a second. That's not science fiction - that's fiber optics!