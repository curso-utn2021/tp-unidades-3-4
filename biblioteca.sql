-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 15-03-2021 a las 05:24:31
-- Versión del servidor: 10.4.17-MariaDB
-- Versión de PHP: 8.0.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `biblioteca`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`) VALUES
(4, 'AUTOAYUDA'),
(3, 'ECONOMIA Y FINANZAS'),
(1, 'FICCION'),
(2, 'NOVELA'),
(5, 'OTROS');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `libros`
--

CREATE TABLE `libros` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `categoria_id` int(11) NOT NULL,
  `persona_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `libros`
--

INSERT INTO `libros` (`id`, `nombre`, `descripcion`, `categoria_id`, `persona_id`) VALUES
(1, 'EL JUEGO DE ENDER', 'HUMANOS CONTRA HORMIGAS', 1, 1),
(2, 'EL INGENIOSO HIDALGO DON QUIJOTE DE LA MANCHA', 'DON QUIJOTE', 2, NULL),
(3, 'COMO PROTEGEN SUS ACTIVOS LOS RICOS Y POR QUE DEBERIAMOS IMITARLOS', 'INTELIGENCIA FINANCIERA', 3, NULL),
(4, 'COMO GANAR AMIGOS E INFLUIR SOBRE LAS PERSONAS', 'AUTOAYUDA CLASICA', 4, NULL),
(5, 'GENTE TOXICA', 'AUTOAYUDA MODERNA', 4, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personas`
--

CREATE TABLE `personas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `alias` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `personas`
--

INSERT INTO `personas` (`id`, `nombre`, `apellido`, `email`, `alias`) VALUES
(1, 'ANA', 'ANAYA', 'ANA.ANAYA@GMAIL.COM', 'ANITA'),
(2, 'BERNARDO', 'BERLIOZ', 'BERNARDO.BERLIOZ@GMAIL.COM', 'BERNARDITO'),
(3, 'CARLOS', 'CASARES', 'CARLOS.CASARES@GMAIL.COM', 'CARLITOS'),
(4, 'DANIEL', 'DEMARIA', 'DANIEL.DEMARIA@GMAIL.COM', 'DANIELITO'),
(5, 'ESTELA', 'ECHEVERRIA', 'ESTELA.ECHEVERRIA@GMAL.COM', 'ESTELITA');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD UNIQUE KEY `categorias_nombre` (`nombre`);

--
-- Indices de la tabla `libros`
--
ALTER TABLE `libros`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `libros_nombre` (`nombre`),
  ADD KEY `libros_categoria_id` (`categoria_id`);

--
-- Indices de la tabla `personas`
--
ALTER TABLE `personas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `prestatarios_email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `libros`
--
ALTER TABLE `libros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `personas`
--
ALTER TABLE `personas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
