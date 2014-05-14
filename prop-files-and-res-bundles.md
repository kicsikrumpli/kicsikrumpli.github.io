#Resource Bundles & Property files
##Property files

Property files provide a means to retrieve constants from files in a unified manner.

###Format of Property File

It is good practice to organize the contents in a "." separated namespace-like manner. For example in the property file *gohome.properties* we might hae=ve the fields

    gohome.date=2013-10-22 17:00
    gohome.format=yyyy-mm-dd HH:mm

By convention the property file is stored in /resources/, that way it can be loaded as a ResourceStream.

###Retrieving Properties

To retriev properties from a property file a new Property instance is created, property file is loaded, then stored values are retrieved by their key (as string). It is customary to extract these key strings into constants:

	//constants
    private static final String GOHOME_PROPS = "gohome.properties";
    private static final String GOHOME_DATE = "gohome.date";
    private static final String GOHOME_FORMAT = "gohome.format";


    //new instance
    Properties props = new Properties();
    props.load(this.class.getClassLoader().getResourceAsStream(GOHOME_PROPS));

    SimpleDateFormatter sdf = new SimpleDateFormatter(props.get(GOHOME_FORMAT));
    Date sometime=sdf.parse(props.get(GOHOME_DATE));

##Resource Bundles

Resource bundles store key-value pairs the same way as property files do. They also provide a mechanism to select *Locale*-specific resources, if present, otherwise fallback to a default.

ResourceBundle has two implementations:

+ ListResourecBundle
  
    `Object[][]` type in-memory representation of ResourceBundle

+ PropertyResourceBundle
  
    ResourceBundle implementation based on property files

To get a locale specific bundle instance:

	String baseName = "myBundle";
	Locale locale = Locale.ENGLISH;
    ResourceBundle bundle = PropertyResourceBundle.getBundle(baseName,locale);

For default locale

    Locale locale=Locale.getDefault();

`getBundle(...)` Tries to open the property file `myBundle_en.properties`. If it is not found, it falls back to opening `myBundle.properties`.

To retrive key-value pairs from the bundle

    bundle.getString("key");
    bundle.getObject("key");

[JavaDoc](http://docs.oracle.com/javase/6/docs/api/java/util/PropertyResourceBundle.html)
